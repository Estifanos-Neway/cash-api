/* eslint-disable indent */
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const dateFormat = require("date-and-time");
const { env } = require("../env");
const { urls } = require("../configs");
const utils = require("../commons/functions");
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
const emailSubjects = require("../assets/emails/email-subjects.json");
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "password-recovery.email.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "email-verification.email.html"), { encoding: "utf-8" });
const signInReportEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "sign-in-report.email.html"), { encoding: "utf-8" });
module.exports = Object.freeze({
    signIn: async (req, res) => {
        catchInternalError(res, async () => {
            const { username, passwordHash } = req.body;
            if (!utils.hasSingleValue(username) || !utils.hasSingleValue(passwordHash)) {
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
                    const adminEmail = signedInAdmin.email;
                    if (adminEmail) {
                        const now = new Date();
                        const at = dateFormat.format(now, "DD/MM/YYYY hh:mm:ss");
                        const device = utils.createUseragentDeviceString(req.get("user-agent"));
                        const ip = req.ip ?? "unknown";
                        let signInReportEmailHtml = utils.replaceAll(signInReportEmail, "--at--", at);
                        signInReportEmailHtml = utils.replaceAll(signInReportEmailHtml, "--device--", device);
                        signInReportEmailHtml = utils.replaceAll(signInReportEmailHtml, "--ip--", ip);
                        await utils["sendEmail"]({ subject: emailSubjects.signUpReport, html: signInReportEmailHtml, to: adminEmail });
                    }
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
            if (!utils.hasSingleValue(oldPasswordHash) || !utils.hasSingleValue(newPasswordHash)) {
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
            if (!utils.hasSingleValue(newUsername)) {
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
            if (!utils.hasSingleValue(newEmail)) {
                res.status(400).json(createSingleResponse(rt.invalidInput));
                // @ts-ignore
            } else if (!utils.isEmail(newEmail)) {
                res.status(400).json(createSingleResponse(rt.invalidEmail));
            } else {
                const html = emailVerificationEmail;
                const subject = emailSubjects.emailVerification;
                const verificationToken = await sendEmailVerificationCode({ email: newEmail, subject, html });
                res.json({ verificationToken });
            }
        });
    },
    verifyEmail: async (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.user.userId;
            const { verificationCode, verificationToken } = req.body;
            if (!utils.hasSingleValue(verificationCode) || !utils.hasSingleValue(verificationToken)) {
                res.status(400).json(createSingleResponse(rt.invalidInput));
            } else {
                let decrypted;
                try {
                    decrypted = utils.decrypt(verificationToken);
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
                } else if (!utils.isEmail(verificationObject.email)) {
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
            if (!utils.hasValue(email)) {
                res.status(400).json(createSingleResponse(rt.requiredParamsNotFound));
            } else if (!utils.isEmail(email)) {
                res.status(400).json(createSingleResponse(rt.invalidEmail));
            } else {
                const adminInfo = await adminsRepo.get();
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(rt.userNotFound));
                } else {
                    const adminEmail = adminInfo.email;
                    if (email !== adminEmail) {
                        res.status(400).json(createSingleResponse(rt.invalidEmail));
                    } else if (!utils.isEmail(adminEmail)) {
                        res.status(404).json(createSingleResponse(rt.cantFindValidEmail));
                    } else {
                        const path = urls.passwordRecoveryPath;
                        const subject = emailSubjects.passwordRecovery;
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
            if (!utils.hasSingleValue(recoveryToken) || !utils.hasSingleValue(newPasswordHash)) {
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