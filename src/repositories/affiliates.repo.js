/* eslint-disable indent */
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const vars = require("../commons/variables");
const configs = require("../config.json");
const { affiliatesDb, filesDb } = require("../database");
const { Affiliate, User, Image } = require("../entities");
const repoUtils = require("./repo.utils");
const signUpVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "affiliate-sign-up-verification-email.html"), { encoding: "utf-8" });
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "affiliate-password-recovery.html"), { encoding: "utf-8" });

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
        } else if (!affiliate.hasValidParentId()) {
            throw utils.createError(rt.invalidParentId, rc.invalidInput);
        } else {
            const emailAlreadyExist = await affiliatesDb.exists({ sanitizedEmail: utils.sanitizeEmail(affiliate.email) });
            if (emailAlreadyExist) {
                throw utils.createError(rt.affiliateEmailAlreadyExist, rc.alreadyExist);
            } else {
                const phoneAlreadyExist = await affiliatesDb.exists({ phone: affiliate.phone });
                if (phoneAlreadyExist) {
                    throw utils.createError(rt.affiliatePhoneAlreadyExist, rc.alreadyExist);
                } else {
                    const verificationCode = utils["createVerificationCode"]();
                    const subject = "Email Verification";
                    // @ts-ignore
                    const html = signUpVerificationEmail.replaceAll("__verificationCode__", verificationCode);
                    await utils.sendEmail({ subject, html, to: email });
                    const validUntil = new Date().getTime() + vars.verificationTokenExpiresIn;
                    const signUpVerificationToken = utils.encrypt(JSON.stringify({
                        affiliate: {
                            fullName,
                            phone,
                            email,
                            passwordHash,
                            parentId
                        },
                        verificationCode,
                        validUntil
                    }));
                    // clean
                    console.log("verificationCode: " + verificationCode);
                    return signUpVerificationToken;
                }
            }
        }
    },
    verifySignUp: async ({ signUpVerificationToken, verificationCode }) => {
        if (!utils.isNonEmptyString(signUpVerificationToken)) {
            throw utils.createError(rt.invalidToken, rc.invalidInput);
        } else if (!utils.isNonEmptyString(verificationCode)) {
            throw utils.createError(rt.invalidVerificationCode, rc.invalidInput);
        } else {
            let signUpVerificationObject;
            try {
                signUpVerificationObject = JSON.parse(utils.decrypt(signUpVerificationToken));
            } catch (error) {
                throw utils.createError(rt.invalidToken, rc.invalidInput);
            }
            if (new Date().getTime() > signUpVerificationObject.validUntil) {
                throw utils.createError(rt.expiredToken, rc.timeout);
            } else if (verificationCode !== signUpVerificationObject.verificationCode) {
                throw utils.createError(rt.invalidVerificationCode, rc.invalidInput);
            } else {
                const affiliate = new Affiliate(signUpVerificationObject.affiliate);
                try {
                    const signedUpAffiliate = await affiliatesDb.create(affiliate);
                    const { refreshToken, accessToken } = await repoUtils.startSession({ userId: signedUpAffiliate.userId, userType: User.userTypes.Affiliate });
                    return {
                        affiliate: adaptAffiliate(signedUpAffiliate),
                        accessToken,
                        refreshToken
                    };
                } catch (error) {
                    switch (error.message) {
                        case rt.affiliateEmailAlreadyExist:
                            throw utils.createError(rt.affiliateEmailAlreadyExist, rc.alreadyExist);
                        case rt.affiliatePhoneAlreadyExist:
                            throw utils.createError(rt.affiliatePhoneAlreadyExist, rc.alreadyExist);
                        default:
                            throw error;
                    }
                }
            }

        }
    },
    signIn: async ({ phoneOrEmail, passwordHash }) => {
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
            const affiliateToSignIn = await affiliatesDb.findOne(affiliate.toJson());
            if (!affiliateToSignIn) {
                throw utils.createError(rt.wrongCredentials, rc.unauthorized);
            } else {
                const { refreshToken, accessToken } = await repoUtils.startSession({ userId: affiliateToSignIn.userId, userType: User.userTypes.Affiliate });
                return {
                    affiliate: adaptAffiliate(affiliateToSignIn),
                    accessToken,
                    refreshToken
                };
            }
        }
    },
    forgotPassword: async ({ email }) => {
        if (!utils.isNonEmptyString(email)) {
            throw utils.createError(rt.invalidInput, rc.invalidInput);
        } else {
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
                    console.dir(recoveryToken, { depth: null });
                    const recoveryLink = `${configs.urls.baseUrl}${configs.urls.passwordRecoveryPath}?u=affiliate&t=${recoveryToken}`;
                    const subject = "Password Recovery";
                    // @ts-ignore
                    const html = passwordRecoveryEmail.replaceAll("__recoveryLink__", recoveryLink);
                    await utils.sendEmail({ subject, html, to: email });
                    return true;
                }
            }
        }

    },
    recoverPassword: async ({ recoveryToken, newPasswordHash }) => {
        if (!utils.isNonEmptyString(recoveryToken) || !utils.isNonEmptyString(newPasswordHash)) {
            throw utils.createError(rt.invalidInput, rc.invalidInput);
        } else {
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
        }
    },
    updateAvatar: async ({ userId, imageReadStream }) => {
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
        const fileName = userId;
        const bucketName = filesDb.bucketNames.avatars;
        await filesDb.delete({ fileName, bucketName });
        await affiliatesDb.updateOne({ id: userId }, { avatar: undefined });
        return true;
    },
    getOne: async ({ userId }) => {
        const affiliate = await affiliatesDb.findOne({ id: userId });
        if (!affiliate) {
            throw utils.createError(rt.userNotFound, rc.notFound);
        } else {
            return adaptAffiliate(affiliate);
        }
    },
    getMany: async () => {
        const affiliatesList = await affiliatesDb.findMany();
        return affiliatesList.map(affiliate => adaptAffiliate(affiliate));

    }
});