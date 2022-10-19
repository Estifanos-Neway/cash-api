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
const rt = require("../commons/response-texts");
const {
    createSingleResponse,
    sendEmailVerification,
    sendEmailVerificationCode,
    sendSuccessResponse,
    catchInternalError } = require("./controller-commons/functions");
const { adminsRepo } = require("../repositories");
const { User } = require("../entities");
const repoUtils = require("../repositories/repo.utils");
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "password-recovery.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "email-verification.html"), { encoding: "utf-8" });
module.exports = Object.freeze({
    signIn: async (req, res) => {
        catchInternalError(res, async () => {
            const { username, passwordHash } = req.body;
            if (!hasSingleValue(username) || !hasSingleValue(passwordHash)) {
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                const signedInAdmin = await adminsRepo.signIn({ username, passwordHash });
                if (signedInAdmin) {
                    const { refreshToken, accessToken } = await repoUtils.startSession({ userId: signedInAdmin.userId, userType: User.userTypes.Admin });
                    const response = {
                        admin: signedInAdmin,
                        accessToken,
                        refreshToken
                    };
                    res.json(response);
                } else {
                    res.status(404).json(createSingleResponse(rt.userNotFound));
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
                res.status(404).json(createSingleResponse(rt.userNotFound));
            }
        });
    },
    getSettings: async (req, res) => {
        catchInternalError(res, async () => {
            const adminSettings = await adminsRepo.getSettings();
            if (adminSettings) {
                res.json(adminSettings);
            } else {
                res.status(404).json(createSingleResponse(rt.userNotFound));
            }
        });
    },
    changePasswordHash: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const { oldPasswordHash, newPasswordHash } = req.body;
            if (!hasSingleValue(oldPasswordHash) || !hasSingleValue(newPasswordHash)) {
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                try {
                    await adminsRepo.changePasswordHash({ userId, oldPasswordHash, newPasswordHash });
                    sendSuccessResponse(res);
                } catch (error) {
                    switch (error.message) {
                        case rt.userNotFound:
                            res.status(404).json(createSingleResponse(rt.userNotFound));
                            break;
                        case rt.wrongPasswordHash:
                            res.status(400).json(createSingleResponse(rt.wrongPasswordHash));
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
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                try {
                    await adminsRepo.changeUsername({ userId, newUsername });
                    sendSuccessResponse(res);
                } catch (error) {
                    if (error.message === rt.userNotFound) {
                        res.status(404).json(createSingleResponse(rt.userNotFound));
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
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else if (!_.isUndefined(updates.commissionRate) && !(_.isNumber(updates.commissionRate) && updates.commissionRate >= 0 && updates.commissionRate <= 100)) {
                res.status(400).json(createSingleResponse(rt.invalidCommissionRate));
            } else {
                try {
                    const result = await adminsRepo.updateSettings({ userId, updates });
                    res.json(result.result);
                } catch (error) {
                    if (error.message === rt.userNotFound) {
                        res.status(404).json(createSingleResponse(rt.userNotFound));
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
                res.status(400).json(createSingleResponse(rt.invalidInput));
                // @ts-ignore
            } else if (!isEmail(newEmail)) {
                res.status(400).json(createSingleResponse(rt.invalidEmail));
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
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                let decrypted;
                try {
                    decrypted = decrypt(verificationToken);
                } catch (error) {
                    if (error.message === "Malformed UTF-8 data") {
                        res.status(400).json(createSingleResponse(rt.invalidToken));
                        return;
                    } else {
                        throw error;
                    }
                }
                let verificationObject;
                try {
                    verificationObject = JSON.parse(decrypted);
                } catch (error) {
                    res.status(400).json(createSingleResponse(rt.invalidToken));
                    return;
                }
                if (new Date().getTime() > verificationObject.validUntil) {
                    res.status(408).json(createSingleResponse(rt.expiredToken));
                } else if (verificationCode !== verificationObject.verificationCode) {
                    res.status(400).json(createSingleResponse(rt.invalidVerificationCode));
                    // @ts-ignore
                } else if (!isEmail(verificationObject.email)) {
                    res.status(400).json(createSingleResponse(rt.invalidToken));
                } else {
                    try {
                        const newEmail = await adminsRepo.updateEmail({ userId, email: verificationObject.email });
                        res.json({ newEmail });
                    } catch (error) {
                        if (error.message === rt.userNotFound) {
                            res.status(404).json(createSingleResponse(rt.userNotFound));
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
                res.status(400).json(createSingleResponse(rt.requiredParamsNotFound));
            } else if (!isEmail(email)) {
                res.status(400).json(createSingleResponse(rt.invalidEmail));
            } else {
                const adminInfo = await adminsRepo.get();
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(rt.userNotFound));
                } else {
                    const adminEmail = adminInfo.email;
                    if (email !== adminEmail) {
                        res.status(400).json(createSingleResponse(rt.invalidEmail));
                    } else if (!isEmail(adminEmail)) {
                        res.status(404).json(createSingleResponse(rt.cantFindValidEmail));
                    } else {
                        const path = urls.passwordRecoveryPath;
                        const subject = "Password recovery";
                        const html = passwordRecoveryEmail;
                        await sendEmailVerification({ email: adminEmail, path, subject, html });
                        res.json(createSingleResponse(rt.success));
                    }
                }
            }
        });
    },
    recoverPassword: async (req, res) => {
        catchInternalError(res, async () => {
            const { recoveryToken, newPasswordHash } = req.body;
            if (!hasSingleValue(recoveryToken) || !hasSingleValue(newPasswordHash)) {
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                const adminInfo = await adminsRepo.get();
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(rt.userNotFound));
                } else {
                    let recoveryObject;
                    try {
                        // @ts-ignore
                        recoveryObject = jwt.verify(recoveryToken, env.JWT_SECRETE);
                    } catch (error) {
                        return res.status(400).json(createSingleResponse(rt.invalidToken));
                    }
                    if (new Date().getTime() > recoveryObject.validUntil) {
                        res.status(408).json(createSingleResponse(rt.expiredToken));
                    } else {
                        const emailFrom = recoveryObject.email;
                        const adminEmail = adminInfo.email;
                        if (emailFrom !== adminEmail) {
                            res.status(400).json(createSingleResponse(rt.invalidToken));
                        } else {
                            try {
                                await adminsRepo.recoverPasswordHash({ email: adminEmail, newPasswordHash });
                                sendSuccessResponse(res);
                            } catch (error) {
                                if (error.message === rt.userNotFound) {
                                    res.status(404).json(createSingleResponse(rt.userNotFound));
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