const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { verificationTokenExpiresIn } = require("../commons/variables");
const { createUserData, createAccessToken } = require("../controllers/controller-commons/functions");
const { affiliatesDb, jwtRefreshesDb } = require("../database");
const { Affiliate } = require("../entities");
const { env } = require("../env");
const signUpVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "affiliate-sign-up-verification-email.html"), { encoding: "utf-8" });

module.exports = Object.freeze({
    signUp: async ({ fullName, phone, email, passwordHash, parentId }) => {
        // @ts-ignore
        const affiliate = new Affiliate({ fullName, phone, email, passwordHash, parentId });
        if (!affiliate.hasValidFullName(true)) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else if (!affiliate.hasValidPhone(true)) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else if (!affiliate.hasValidEmail(true)) {
            throw utils.createError(rt.invalidEmail, rc.invalidInput);
        } else if (!affiliate.hasValidPasswordHash(true)) {
            throw utils.createError(rt.invalidPasswordHash, rc.invalidInput);
        } else if (!affiliate.hasValidParentId()) {
            throw utils.createError(rt.invalidParentId, rc.invalidInput);
        } else {
            const emailAlreadyExist = await affiliatesDb.exists({ sanitizedEmail: utils.sanitizeEmail(affiliate.email) });
            if (emailAlreadyExist) {
                throw utils.createError(rt.affiliateEmailAlreadyExist, rc.alreadyExist);
            } else {
                const verificationCode = utils["createVerificationCode"]();
                const subject = "Email Verification";
                // @ts-ignore
                const html = signUpVerificationEmail.replaceAll("__verificationCode__", verificationCode);
                await utils.sendEmail({ subject, html, to: email });
                const validUntil = new Date().getTime() + verificationTokenExpiresIn;
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
                    const userData = createUserData(signedUpAffiliate.userId, "affiliate");
                    const accessToken = createAccessToken(userData);
                    // @ts-ignore
                    const refreshToken = jwt.sign(userData, env.JWT_REFRESH_SECRETE);
                    await jwtRefreshesDb.create(refreshToken);
                    return {
                        affiliate: signedUpAffiliate.toJson(),
                        accessToken,
                        refreshToken
                    };
                } catch (error) {
                    if (error.message === rt.affiliateEmailAlreadyExist) {
                        throw utils.createError(rt.affiliateEmailAlreadyExist, rc.alreadyExist);
                    } else {
                        throw error;
                    }
                }
            }

        }
    }
});