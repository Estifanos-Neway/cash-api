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
    invalidInput} = require("../commons/response-texts");
const {
    errorHandler,
    createUserData,
    createAccessToken,
    createSingleResponse,
    sendEmailVerification,
    sendEmailVerificationCode } = require("./controller-commons/functions");
const { addJwtRefreshRepo } = require("../repositories/jwt-refresh-repositories");
const {
    signInAdminRepo,
    changeAdminPasswordHashRepo,
    getAdminRepo,
    updateAdminSettingsRepo,
    getAdminSettingsRepo,
    recoverAdminPasswordHashRepo,
    updateAdminEmailRepo,
    changeAdminUsernameRepo } = require("../repositories/admin-repositories");
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src/assets/emails/password-recovery.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src/assets/emails/email-verification.html"), { encoding: "utf-8" });

exports.signInAdminCont = async (req, res) => {
    try {
        const { username, passwordHash } = req.body;
        if (!hasSingleValue(username) || !hasSingleValue(passwordHash)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const signedInAdmin = await signInAdminRepo({ username, passwordHash });
            if (signedInAdmin) {
                const userData = createUserData(signedInAdmin.userId, "admin");
                // @ts-ignore
                const accessToken = createAccessToken(userData);
                // @ts-ignore
                const refreshToken = jwt.sign(userData, env.JWT_REFRESH_SECRETE);
                await addJwtRefreshRepo(refreshToken);
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
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.getAdminCont = async (req, res) => {
    try {
        const adminInfo = await getAdminRepo();
        if (adminInfo) {
            res.json(adminInfo);
        } else {
            res.status(404).json(createSingleResponse(userNotFoundResponseText));
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.getAdminSettingsCont = async (req, res) => {
    try {
        const adminSettings = await getAdminSettingsRepo();
        if (adminSettings) {
            res.json(adminSettings);
        } else {
            res.status(404).json(createSingleResponse(userNotFoundResponseText));
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.changeAdminPasswordHashCont = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { oldPasswordHash, newPasswordHash } = req.body;
        if (!hasSingleValue(oldPasswordHash) || !hasSingleValue(newPasswordHash)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const result = await changeAdminPasswordHashRepo({ userId, oldPasswordHash, newPasswordHash });
            if (result.success) {
                res.json(createSingleResponse(successResponseText));
            } else {
                res.status(404).json(createSingleResponse(result.result));
            }
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.changeAdminUsernameCont = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { newUsername } = req.body;
        if (!hasSingleValue(newUsername)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const result = await changeAdminUsernameRepo({ userId, newUsername });
            if (result.success) {
                res.json(createSingleResponse(successResponseText));
            } else {
                res.status(404).json(createSingleResponse(result.result));
            }
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.updateAdminSettingsCont = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;
        if (!_.isPlainObject(updates)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const result = await updateAdminSettingsRepo({ userId, updates });
            if (result.success) {
                res.json(result.result);
            } else {
                res.status(404).json(createSingleResponse(result.result));
            }
        }
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.sendAdminEmailVerificationCont = async (req, res) => {
    try {
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
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.verifyAdminEmailCont = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { verificationCode, verificationToken } = req.body;
        if (!hasSingleValue(verificationCode) || !hasSingleValue(verificationToken)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const decrypted = decrypt(verificationToken);
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
                const result = await updateAdminEmailRepo({ userId, email: verificationObject.email });
                if (result.success) {
                    res.json({ newEmail: result.result });
                } else {
                    res.status(404).json(createSingleResponse(result.result));
                }
            }
        }
    } catch (error) {
        if (error.message === "Malformed UTF-8 data") {
            res.status(400).json(createSingleResponse(invalidTokenResponseText));
        } else {
            errorHandler(error, res);
        }
    }
};


exports.sendAdminPasswordRecoveryEmailCont = async (req, res) => {
    try {
        const { email } = req.body;
        if (!hasValue(email)) {
            res.status(400).json(createSingleResponse(invalidInput));
        } else if (!isEmail(email)) {
            res.status(400).json(createSingleResponse(invalidEmailResponseText));
        } else {
            const adminInfo = await getAdminRepo();
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
    } catch (error) {
        errorHandler(error, res);
    }
};

exports.recoverAdminPasswordCont = async (req, res) => {
    try {
        const { recoveryToken, newPasswordHash } = req.body;
        if (!hasSingleValue(recoveryToken) || !hasSingleValue(newPasswordHash)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            const adminInfo = await getAdminRepo();
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
                        const result = await recoverAdminPasswordHashRepo({ email: adminEmail, newPasswordHash });
                        if (result.success) {
                            res.json(createSingleResponse(successResponseText));
                        } else {
                            res.status(404).json(createSingleResponse(result.result));
                        }
                    }
                }
            }
        }
    } catch (error) {
        errorHandler(error, res);
    }
};