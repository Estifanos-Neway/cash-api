/* eslint-disable indent */
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const { env } = require("../env");
const { urls } = require("../config.json");
const {
    decrypt,
    isEmail,
    hasSingleValue,
    hasValue } = require("../commons/functions");
const {
    invalidEmailResponseText,
    invalidVerificationCodeResponseText,
    expiredTokenResponseText,
    invalidTokenResponseText,
    cantFindValidEmailResponseText,
    successResponseText,
    userNotFoundResponseText,
    invalidInputResponseText,
    wrongPasswordHashResponseText,
    invalidCommissionRateResponseText,
    requiredParamsNotFoundResponseText } = require("../commons/response-texts");
const {
    createUserData,
    createAccessToken,
    createSingleResponse,
    sendEmailVerification,
    sendEmailVerificationCode,
    sendSuccessResponse,
    catchInternalError } = require("./controller-commons/functions");
const { jwtRefreshesRepo } = require("../repositories");
const { adminsRepo } = require("../repositories");
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "password-recovery.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "email-verification.html"), { encoding: "utf-8" });
module.exports = Object.freeze({
    signIn: async (req, res) => {
        catchInternalError(res, async () => {
            const { username, passwordHash } = req.body;
            if (!hasSingleValue(username) || !hasSingleValue(passwordHash)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                const signedInAdmin = await adminsRepo.signIn({ username, passwordHash });
                if (signedInAdmin) {
                    const userData = createUserData(signedInAdmin.userId, "admin");
                    // @ts-ignore
                    const accessToken = createAccessToken(userData);
                    // @ts-ignore
                    const refreshToken = jwt.sign(userData, env.JWT_REFRESH_SECRETE);
                    await jwtRefreshesRepo.add(refreshToken);
                    const response = {
                        admin: signedInAdmin,
                        accessToken,
                        refreshToken
                    };
                    res.json(response);
                } else {
                    res.status(404).json(createSingleResponse(userNotFoundResponseText));
                }
            }
        });
    },
    get: async (req, res) => {
        catchInternalError(res, async () => {
            const adminInfo = await adminsRepo.get();
            if (adminInfo) {
                res.json(adminInfo);
            } else {
                res.status(404).json(createSingleResponse(userNotFoundResponseText));
            }
        });
    },
    getSettings: async (req, res) => {
        catchInternalError(res, async () => {
            const adminSettings = await adminsRepo.getSettings();
            if (adminSettings) {
                res.json(adminSettings);
            } else {
                res.status(404).json(createSingleResponse(userNotFoundResponseText));
            }
        });
    },
    changePasswordHash: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const { oldPasswordHash, newPasswordHash } = req.body;
            if (!hasSingleValue(oldPasswordHash) || !hasSingleValue(newPasswordHash)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                try {
                    await adminsRepo.changePasswordHash({ userId, oldPasswordHash, newPasswordHash });
                    sendSuccessResponse(res);
                } catch (error) {
                    switch (error.message) {
                        case userNotFoundResponseText:
                            res.status(404).json(createSingleResponse(userNotFoundResponseText));
                            break;
                        case wrongPasswordHashResponseText:
                            res.status(400).json(createSingleResponse(wrongPasswordHashResponseText));
                            break;
                        default:
                            throw error;
                    }
                }
            }
        });
    },
    changeUsername: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const { newUsername } = req.body;
            if (!hasSingleValue(newUsername)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                try {
                    await adminsRepo.changeUsername({ userId, newUsername });
                    sendSuccessResponse(res);
                } catch (error) {
                    if (error.message === userNotFoundResponseText) {
                        res.status(404).json(createSingleResponse(userNotFoundResponseText));
                    } else {
                        throw error;
                    }
                }
            }
        });
    },
    updateSettings: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const updates = req.body;
            if (!_.isPlainObject(updates)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else if (!_.isUndefined(updates.commissionRate) && !(_.isNumber(updates.commissionRate) && updates.commissionRate >= 0 && updates.commissionRate <= 100)) {
                res.status(400).json(createSingleResponse(invalidCommissionRateResponseText));
            } else {
                try {
                    const result = await adminsRepo.updateSettings({ userId, updates });
                    res.json(result.result);
                } catch (error) {
                    if (error.message === userNotFoundResponseText) {
                        res.status(404).json(createSingleResponse(userNotFoundResponseText));
                    } else {
                        throw error;
                    }
                }
            }
        });
    },
    sendEmailVerification: async (req, res) => {
        catchInternalError(res, async () => {
            const { newEmail } = req.body;
            if (!hasSingleValue(newEmail)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
                // @ts-ignore
            } else if (!isEmail(newEmail)) {
                res.status(400).json(createSingleResponse(invalidEmailResponseText));
            } else {
                const html = emailVerificationEmail;
                const subject = "Email verification";
                const verificationToken = await sendEmailVerificationCode({ email: newEmail, subject, html });
                res.json({ verificationToken });
            }
        });
    },
    verifyEmail: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const { verificationCode, verificationToken } = req.body;
            if (!hasSingleValue(verificationCode) || !hasSingleValue(verificationToken)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                let decrypted;
                try {
                    decrypted = decrypt(verificationToken);
                } catch (error) {
                    if (error.message === "Malformed UTF-8 data") {
                        res.status(400).json(createSingleResponse(invalidTokenResponseText));
                        return;
                    } else {
                        throw error;
                    }
                }
                let verificationObject;
                try {
                    verificationObject = JSON.parse(decrypted);
                } catch (error) {
                    res.status(400).json(createSingleResponse(invalidTokenResponseText));
                    return;
                }
                if (new Date().getTime() > verificationObject.validUntil) {
                    res.status(408).json(createSingleResponse(expiredTokenResponseText));
                } else if (verificationCode !== verificationObject.verificationCode) {
                    res.status(400).json(createSingleResponse(invalidVerificationCodeResponseText));
                    // @ts-ignore
                } else if (!isEmail(verificationObject.email)) {
                    res.status(400).json(createSingleResponse(invalidTokenResponseText));
                } else {
                    try {
                        const newEmail = await adminsRepo.updateEmail({ userId, email: verificationObject.email });
                        res.json({ newEmail });
                    } catch (error) {
                        if (error.message === userNotFoundResponseText) {
                            res.status(404).json(createSingleResponse(userNotFoundResponseText));
                        } else {
                            throw error;
                        }
                    }
                }
            }
        });
    },
    sendPasswordRecoveryEmail: async (req, res) => {
        catchInternalError(res, async () => {
            const { email } = req.body;
            if (!hasValue(email)) {
                res.status(400).json(createSingleResponse(requiredParamsNotFoundResponseText));
            } else if (!isEmail(email)) {
                res.status(400).json(createSingleResponse(invalidEmailResponseText));
            } else {
                const adminInfo = await adminsRepo.get();
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(userNotFoundResponseText));
                } else {
                    const adminEmail = adminInfo.email;
                    if (email !== adminEmail) {
                        res.status(400).json(createSingleResponse(invalidEmailResponseText));
                    } else if (!isEmail(adminEmail)) {
                        res.status(404).json(createSingleResponse(cantFindValidEmailResponseText));
                    } else {
                        const path = urls.passwordRecoveryPath;
                        const subject = "Password recovery";
                        const html = passwordRecoveryEmail;
                        await sendEmailVerification({ email: adminEmail, path, subject, html });
                        res.json(createSingleResponse(successResponseText));
                    }
                }
            }
        });
    },
    recoverPassword: async (req, res) => {
        catchInternalError(res, async () => {
            const { recoveryToken, newPasswordHash } = req.body;
            if (!hasSingleValue(recoveryToken) || !hasSingleValue(newPasswordHash)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                const adminInfo = await adminsRepo.get();
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(userNotFoundResponseText));
                } else {
                    let recoveryObject;
                    try {
                        // @ts-ignore
                        recoveryObject = jwt.verify(recoveryToken, env.JWT_SECRETE);
                    } catch (error) {
                        return res.status(400).json(createSingleResponse(invalidTokenResponseText));
                    }
                    if (new Date().getTime() > recoveryObject.validUntil) {
                        res.status(408).json(createSingleResponse(expiredTokenResponseText));
                    } else {
                        const emailFrom = recoveryObject.email;
                        const adminEmail = adminInfo.email;
                        if (emailFrom !== adminEmail) {
                            res.status(400).json(createSingleResponse(invalidTokenResponseText));
                        } else {
                            try {
                                await adminsRepo.recoverPasswordHash({ email: adminEmail, newPasswordHash });
                                sendSuccessResponse(res);
                            } catch (error) {
                                if (error.message === userNotFoundResponseText) {
                                    res.status(404).json(createSingleResponse(userNotFoundResponseText));
                                } else {
                                    throw error;
                                }
                            }
                        }
                    }
                }
            }
        });
    }
});