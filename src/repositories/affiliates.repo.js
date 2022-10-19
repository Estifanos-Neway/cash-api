/* eslint-disable indent */
const fs = require("fs");
const path = require("path");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const vars = require("../commons/variables");
const configs = require("../config.json");
const { affiliatesDb } = require("../database");
const { Affiliate, User } = require("../entities");
const repoUtils = require("./repo.utils");
const signUpVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "affiliate-sign-up-verification-email.html"), { encoding: "utf-8" });
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "affiliate-password-recovery.html"), { encoding: "utf-8" });

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
                        affiliate: signedUpAffiliate.toJson(),
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
                    affiliate: affiliateToSignIn.toJson(),
                    accessToken,
                    refreshToken
                };
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
                const affiliateId = emailExist.affiliateId;
                const validUntil = new Date().getTime() + vars.verificationTokenExpiresIn;
                const recoveryObject = { affiliateId, validUntil };
                const recoveryToken = utils.encrypt(JSON.stringify(recoveryObject));
                const recoveryLink = `${configs.urls.baseUrl}${configs.urls.passwordRecoveryPath}?u=affiliate&t=${recoveryToken}`;
                const subject = "Password Recovery";
                // @ts-ignore
                const html = passwordRecoveryEmail.replaceAll("__recoveryLink__", recoveryLink);
                await utils.sendEmail({ subject, html, to: email });
            }
        }

    }
});