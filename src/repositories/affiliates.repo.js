/* eslint-disable indent */
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const vars = require("../commons/variables");
const configs = require("../configs");
const { affiliatesDb, filesDb, db, transactionsDb } = require("../database");
const { Affiliate, User, Image, Transaction } = require("../entities");
const repoUtils = require("./repo.utils");
const emailSubjects = require("../assets/emails/email-subjects.json");
const signUpVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "sign-up-verification.email.html"), { encoding: "utf-8" });
const verificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "email-verification.email.html"), { encoding: "utf-8" });
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "password-recovery.email.html"), { encoding: "utf-8" });
const signInReportEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "sign-in-report.email.html"), { encoding: "utf-8" });

const avatarBasePath = "/images/avatars";
function adaptAffiliate(affiliate) {
    const affiliateJson = affiliate.toJson();
    delete affiliateJson.passwordHash;
    return affiliateJson;
}
class passwordRecoveryObject {
    // #userId
    #userId;
    set userId(userId) {
        if (utils.isNonEmptyString(userId)) {
            this.#userId = userId;
        } else {
            throw Error();
        }
    }
    get userId() {
        return this.#userId;
    }

    // #validUntil
    #validUntil;
    set validUntil(validUntil) {
        if (_.isNumber(validUntil)) {
            this.#validUntil = validUntil;
        } else {
            throw Error();
        }
    }
    get validUntil() {
        return this.#validUntil;
    }

    constructor({ userId, validUntil }) {
        this.userId = userId;
        this.validUntil = validUntil;
    }

    toJson() {
        return utils.removeUndefined({
            userId: this.userId,
            validUntil: this.validUntil
        });
    }
}
async function createSignUpTransactionList(signedUpAffiliate) {
    const {
        affiliatesWallet: { initialBalance },
        signingUpCredits: { maxNumberOfParentsToBeCredited, initialCreditAmount, creditDivider } } = configs;
    const transactionList = [];
    const joiningBonus = new Transaction(
        {
            affiliate: {
                userId: signedUpAffiliate.userId
            },
            amount: initialBalance,
            // @ts-ignore
            reason: new Transaction.Reason({
                kind: Transaction.Reason.kinds.JoiningBonus
            }).toJson()
        }
    );
    transactionList.push(joiningBonus);

    let parentId = signedUpAffiliate.parentId;
    let parentRank = 1;
    let creditAmount = initialCreditAmount;
    let child = signedUpAffiliate;
    while (parentId && parentRank <= maxNumberOfParentsToBeCredited) {
        const parent = await affiliatesDb.findOne({ id: parentId });
        if (!parent) {
            break;
        }
        const childBecomeParent = new Transaction(
            {
                affiliate: {
                    userId: parent.userId
                },
                amount: creditAmount,
                // @ts-ignore
                reason: new Transaction.Reason({
                    kind: Transaction.Reason.kinds.ChildBecomeParent,
                    affiliate: {
                        userId: child.userId
                    }
                }).toJson()
            }
        );
        transactionList.push(childBecomeParent);

        parentId = parent.parentId;
        child = parent;
        parentRank += 1;
        creditAmount /= creditDivider;
    }
    return transactionList;
}

async function validateUserIdExistence({ userId }) {
    if (!User.isValidUserId(userId)) {
        throw utils.createError(rt.invalidUserId, rc.invalidInput);
    } else {
        const affiliate = await affiliatesDb.exists({ id: userId });
        if (!affiliate) {
            throw utils.createError(rt.userNotFound, rc.notFound);
        }
    }
}
const strict = true;
module.exports = Object.freeze({
    signUp: async ({ fullName, phone, email, passwordHash, parentId }) => {
        // @ts-ignore
        const affiliate = new Affiliate({ fullName, phone, email, passwordHash, parentId });
        if (!affiliate.hasValidFullName(strict)) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else if (!affiliate.hasValidPhone(strict)) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else if (!affiliate.hasValidEmail(strict)) {
            throw utils.createError(rt.invalidEmail, rc.invalidInput);
        } else if (!affiliate.hasValidPasswordHash(strict)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else {
            if (!affiliate.hasValidParentId()) {
                affiliate.parentId = undefined;
            }
            const emailAlreadyExist = await affiliatesDb.exists({ sanitizedEmail: utils.sanitizeEmail(affiliate.email) });
            if (emailAlreadyExist) {
                throw utils.createError(rt.affiliateEmailAlreadyExist, rc.conflict);
            } else {
                const phoneAlreadyExist = await affiliatesDb.exists({ phone: affiliate.phone });
                if (phoneAlreadyExist) {
                    throw utils.createError(rt.affiliatePhoneAlreadyExist, rc.conflict);
                } else {
                    const verificationObject = {
                        affiliate: {
                            fullName,
                            phone,
                            email,
                            passwordHash,
                            parentId: affiliate.parentId
                        }
                    };
                    return await repoUtils.sendEmailVerificationCode({ verificationEmail: signUpVerificationEmail, email, verificationObject });
                }
            }
        }
    },
    verifySignUp: async ({ verificationToken, verificationCode }) => {
        const verificationObject = repoUtils.validateEmailVerification({ verificationToken, verificationCode });
        const affiliate = new Affiliate(verificationObject.affiliate);
        if (affiliate.parentId) {
            const parentExists = await affiliatesDb.exists({ id: affiliate.parentId });
            if (!parentExists) {
                affiliate.parentId = undefined;
            }
        }
        try {
            const dbSession = new db.DbSession();
            await dbSession.startSession();
            const sessionOption = { session: dbSession.session };
            let affiliateSignIn;
            await dbSession.withTransaction(async () => {
                let signedUpAffiliate = await affiliatesDb.create(affiliate, sessionOption);
                const signUpTransactionList = await createSignUpTransactionList(signedUpAffiliate);
                for (let transaction of signUpTransactionList) {
                    const userId = transaction.affiliate.userId;
                    const incrementor = { "wallet.totalMade": transaction.amount, "wallet.currentBalance": transaction.amount };
                    const affiliate = await affiliatesDb.increment({ id: userId }, incrementor, sessionOption);
                    await transactionsDb.create(transaction, sessionOption);
                    if (userId === signedUpAffiliate.userId) {
                        signedUpAffiliate = affiliate;
                    }
                }
                const { refreshToken, accessToken } = await repoUtils.startSession(
                    {
                        userId: signedUpAffiliate.userId,
                        userType: User.userTypes.Affiliate
                    },
                    sessionOption
                );
                affiliateSignIn = {
                    affiliate: adaptAffiliate(signedUpAffiliate),
                    accessToken,
                    refreshToken
                };
            });
            await dbSession.endSession();
            // @ts-ignore
            return affiliateSignIn;
        } catch (error) {
            switch (error.message) {
                case rt.affiliateEmailAlreadyExist:
                    throw utils.createError(rt.affiliateEmailAlreadyExist, rc.conflict);
                case rt.affiliatePhoneAlreadyExist:
                    throw utils.createError(rt.affiliatePhoneAlreadyExist, rc.conflict);
                default:
                    throw error;
            }
        }
    },
    signIn: async ({ phoneOrEmail, passwordHash, device, ip }) => {
        const signInObject = { passwordHash };
        if (utils.isEmail(phoneOrEmail)) {
            signInObject.email = phoneOrEmail;
        } else if (utils.isPhone(phoneOrEmail)) {
            signInObject.phone = phoneOrEmail;
        } else {
            throw utils.createError(rt.invalidPhoneOrEmail, rc.invalidInput);
        }
        // @ts-ignore
        const affiliate = new Affiliate(signInObject);
        if (!affiliate.hasValidPasswordHash(strict)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else {
            const signInParams = { passwordHash: signInObject.passwordHash };
            if (affiliate.email) {
                signInParams.sanitizedEmail = utils.sanitizeEmail(affiliate.email);
            } else {
                signInParams.phone = affiliate.phone;
            }
            const affiliateToSignIn = await affiliatesDb.findOne(signInParams);
            if (!affiliateToSignIn) {
                throw utils.createError(rt.wrongCredentials, rc.unauthorized);
            } else {
                const { refreshToken, accessToken } = await repoUtils.startSession({ userId: affiliateToSignIn.userId, userType: User.userTypes.Affiliate });
                const signedInAffiliate = {
                    affiliate: adaptAffiliate(affiliateToSignIn),
                    accessToken,
                    refreshToken
                };
                const affiliateEmail = signedInAffiliate.affiliate.email;
                const signInReportEmailHtml = utils.replaceAll(utils.replaceAll(signInReportEmail, "--device--", device), "--ip--", ip);
                await utils.sendEmail({ subject: emailSubjects.signUpReport, html: signInReportEmailHtml, to: affiliateEmail });
                return signedInAffiliate;
            }
        }
    },
    forgotPassword: async ({ email }) => {
        // @ts-ignore
        const affiliate = new Affiliate({ email });
        if (!affiliate.hasValidEmail(strict)) {
            throw utils.createError(rt.invalidEmail, rc.invalidInput);
        } else {
            const emailExist = await affiliatesDb.exists({ sanitizedEmail: utils.sanitizeEmail(affiliate.email) });
            if (!emailExist) {
                throw utils.createError(rt.userNotFound, rc.notFound);
            } else {
                const userId = emailExist.userId;
                const validUntil = new Date().getTime() + vars.verificationTokenExpiresIn;
                const recoveryObject = new passwordRecoveryObject({ userId, validUntil });
                const recoveryToken = utils.encrypt(JSON.stringify(recoveryObject.toJson()));
                // clean
                console.dir(`recoveryToken: ${recoveryToken}`, { depth: null });
                const recoveryLink = `${configs.urls.baseUrl}${configs.urls.passwordRecoveryPath}?u=affiliate&t=${recoveryToken}`;
                const subject = emailSubjects.passwordRecovery;
                // @ts-ignore
                const html = utils.replaceAll(passwordRecoveryEmail, "__recoveryLink__", recoveryLink);
                await utils.sendEmail({ subject, html, to: email });
                return true;
            }
        }

    },
    recoverPassword: async ({ recoveryToken, newPasswordHash }) => {
        // @ts-ignore
        const affiliate = new Affiliate({ passwordHash: newPasswordHash });
        if (!affiliate.hasValidPasswordHash(strict)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else {
            let recoveryObject;
            try {
                const recoveryObjectJson = JSON.parse(utils.decrypt(recoveryToken));
                recoveryObject = new passwordRecoveryObject(recoveryObjectJson);
            } catch (error) {
                throw utils.createError(rt.invalidToken, rc.invalidInput);
            }
            if (recoveryObject.validUntil < new Date().getTime()) {
                throw utils.createError(rt.expiredToken, rc.timeout);
            } else {
                await affiliatesDb.updateOne({ id: recoveryObject.userId }, { passwordHash: newPasswordHash });
                return true;
            }
        }

    },
    updateAvatar: async ({ userId, imageReadStream }) => {
        await validateUserIdExistence({ userId });
        const fileName = userId;
        const bucketName = filesDb.bucketNames.avatars;
        await filesDb.delete({ fileName, bucketName });
        await filesDb.upload({ readStream: imageReadStream, fileName, bucketName });
        const path = `${avatarBasePath}/${fileName}`;
        const avatar = new Image({ path }).toJson();
        await affiliatesDb.updateOne({ id: userId }, { avatar });
        return avatar;
    },
    deleteAvatar: async ({ userId }) => {
        await validateUserIdExistence({ userId });
        const fileName = userId;
        const bucketName = filesDb.bucketNames.avatars;
        await filesDb.delete({ fileName, bucketName });
        await affiliatesDb.updateOne({ id: userId }, { avatar: undefined });
        return true;
    },
    getOne: async ({ userId }) => {
        await validateUserIdExistence({ userId });
        const affiliate = await affiliatesDb.findOne({ id: userId });
        if (!affiliate) {
            throw utils.createError(rt.userNotFound, rc.notFound);
        } else {
            return adaptAffiliate(affiliate);
        }
    },
    getMany: async ({ getManyQueries }) => {
        let { filter, skip, limit, select, sort } = repoUtils.validateGetManyQuery({ getManyQueries, defaultLimit: 8, maxLimit: 20 });
        sort = _.isEmpty(sort) ? { memberSince: -1 } : sort;
        const affiliatesList = await affiliatesDb.findMany({ filter, skip, limit, select, sort });
        return affiliatesList.map(affiliate => adaptAffiliate(affiliate));
    },
    getChildren: async ({ userId, getManyQueries }) => {
        let { skip, limit, sort } = repoUtils.validateGetManyQuery({ getManyQueries, defaultLimit: 8, maxLimit: 20 });
        sort = _.isEmpty(sort) ? { memberSince: -1 } : sort;
        await validateUserIdExistence({ userId });
        const childrenList = [];
        // @ts-ignore
        const children = await affiliatesDb.findMany({ filter: { parentId: userId }, select: ["fullName"], sort });
        for (let child of children) {
            child = child.toJson();
            child.childrenCount = await affiliatesDb.count({ parentId: child.userId });
            childrenList.push(child);
        }
        if ("childrenCount" in sort) {
            childrenList.sort((child1, child2) => {
                return child1.childrenCount < child2.childrenCount ? -sort.childrenCount : sort.childrenCount;
            });
        }
        return childrenList.splice(skip, limit);
    },
    getTransactions: async ({ userId, getManyQueries }) => {
        await validateUserIdExistence({ userId });
        let { filter, skip, limit, select, sort } = repoUtils.validateGetManyQuery({ getManyQueries, defaultLimit: 8, maxLimit: 20 });
        sort = _.isEmpty(sort) ? { transactedAt: -1 } : sort;
        filter = { ...filter, "affiliate.userId": userId };
        const transactionsList = await transactionsDb.findMany({ filter, skip, limit, select, sort });
        return transactionsList.map(transaction => transaction.toJson());
    },
    updatePasswordHash: async ({ userId, oldPasswordHash, newPasswordHash }) => {
        await validateUserIdExistence({ userId });
        // @ts-ignore
        const affiliateWithOldPasswordHash = new Affiliate({ passwordHash: oldPasswordHash });
        if (!affiliateWithOldPasswordHash.hasValidPasswordHash(strict)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else {
            // @ts-ignore
            const affiliateWithNewPasswordHash = new Affiliate({ passwordHash: newPasswordHash });
            if (!affiliateWithNewPasswordHash.hasValidPasswordHash(strict)) {
                throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
            } else {
                const correctOldPasswordHash = await affiliatesDb.exists({ id: userId, passwordHash: affiliateWithOldPasswordHash.passwordHash });
                if (!correctOldPasswordHash) {
                    throw utils.createError(rt.wrongPasswordHash, rc.invalidInput);
                } else {
                    await affiliatesDb.updateOne({ id: userId }, { passwordHash: affiliateWithNewPasswordHash.passwordHash });
                    return true;
                }
            }
        }
    },
    updateEmail: async ({ userId, newEmail }) => {
        await validateUserIdExistence({ userId });
        // @ts-ignore
        const affiliate = new Affiliate({ email: newEmail });
        if (!affiliate.hasValidEmail(strict)) {
            throw utils.createError(rt.invalidEmail, rc.invalidInput);
        } else {
            const emailAlreadyExist = await affiliatesDb.exists({ sanitizedEmail: utils.sanitizeEmail(affiliate.email) });
            if (emailAlreadyExist) {
                throw utils.createError(rt.affiliateEmailAlreadyExist, rc.conflict);
            } else {
                const verificationObject = {
                    userId,
                    email: affiliate.email
                };
                return await repoUtils.sendEmailVerificationCode({ verificationEmail, email: affiliate.email, verificationObject });
            }
        }
    },
    verifyEmail: async ({ verificationToken, verificationCode }) => {
        const { userId, email } = repoUtils.validateEmailVerification({ verificationToken, verificationCode });
        try {
            await affiliatesDb.updateOne({ id: userId }, { email });
            return true;
        } catch (error) {
            switch (error.message) {
                case rt.affiliateEmailAlreadyExist:
                    throw utils.createError(rt.affiliateEmailAlreadyExist, rc.conflict);
                default:
                    throw error;
            }
        }
    },
    updatePhone: async ({ userId, newPhone }) => {
        await validateUserIdExistence({ userId });
        // @ts-ignore
        const affiliate = new Affiliate({ phone: newPhone });
        if (!affiliate.hasValidPhone(strict)) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else {
            try {
                await affiliatesDb.updateOne({ id: userId }, { phone: affiliate.phone });
                return true;
            } catch (error) {
                switch (error.message) {
                    case rt.affiliatePhoneAlreadyExist:
                        throw utils.createError(rt.affiliatePhoneAlreadyExist, rc.conflict);
                    default:
                        throw error;
                }
            }
        }
    },
    updateFullName: async ({ userId, newFullName }) => {
        await validateUserIdExistence({ userId });
        // @ts-ignore
        const affiliate = new Affiliate({ fullName: newFullName });
        if (!affiliate.hasValidFullName(strict)) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else {
            await affiliatesDb.updateOne({ id: userId }, { fullName: affiliate.fullName });
            return true;
        }
    },
    delete: async ({ userId, passwordHash }) => {
        await validateUserIdExistence({ userId });
        // @ts-ignore
        const affiliateWithPasswordHash = new Affiliate({ passwordHash });
        if (!affiliateWithPasswordHash.hasValidPasswordHash(strict)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else {
            const correctPasswordHash = await affiliatesDb.exists({ id: userId, passwordHash: affiliateWithPasswordHash.passwordHash });
            if (!correctPasswordHash) {
                throw utils.createError(rt.wrongPasswordHash, rc.unauthorized);
            } else {
                const affiliate = await affiliatesDb.deleteOne({ id: userId });
                if (!affiliate) {
                    throw utils.createError(rt.userNotFound, rc.notFound);
                } else {
                    return true;
                }
            }
        }
    }
});