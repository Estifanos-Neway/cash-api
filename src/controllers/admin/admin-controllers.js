const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const {
    decrypt,
    isEmail,
    hasSingleValue } = require("../../commons/functions");
const {
    invalidEmailResponseText,
    invalidVerificationCodeResponseText,
    expiredTokenResponseText,
    invalidTokenResponseText,
    cantFindValidEmailResponseText,
    successResponseText,
    userNotFoundResponseText,
    invalidInputResponseText } = require("../../commons/response-texts");
const {
    errorHandler,
    createUserData,
    createAccessToken,
    createSingleResponse } = require("../controller-commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { urls } = require("../../config.json");
const { updateAdminEmailRepo } = require("../../repositories/admin");
const passwordRecoveryEmail = fs.readFileSync(path.resolve("src/assets/emails/password-recovery.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src/assets/emails/email-verification.html"), { encoding: "utf-8" });
exports.makeSignInAdminCont = ({ signInAdminRepo, addJwtRefreshRepo }) => {
    return async (req, res) => {
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
};

exports.makeGetAdminCont = ({ getAdminRepo }) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const adminInfo = await getAdminRepo({ userId });
            if (adminInfo) {
                res.json(adminInfo);
            } else {
                res.status(404).json(createSingleResponse(userNotFoundResponseText));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};

exports.makeGetAdminSettingsCont = ({ getAdminSettingsRepo }) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const adminSettings = await getAdminSettingsRepo({ userId });
            if (adminSettings) {
                res.json(adminSettings);
            } else {
                res.status(404).json(createSingleResponse(userNotFoundResponseText));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};

exports.makeChangeAdminPasswordHashCont = ({ changeAdminPasswordHashRepo }) => {
    return async (req, res) => {
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
};

exports.makeChangeAdminUsernameCont = ({ changeAdminUsernameRepo }) => {
    return async (req, res) => {
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
};

exports.makeUpdateAdminSettingsCont = ({ updateAdminSettingsRepo }) => {
    return async (req, res) => {
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
};

exports.makeSendAdminEmailVerificationCont = ({ sendEmailVerificationCode }) => {
    return async (req, res) => {
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
};

exports.makeVerifyAdminEmailCont = () => {
    return async (req, res) => {
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
};


exports.makeSendAdminPasswordRecoveryEmailCont = ({ getAdminRepo, sendEmailVerification }) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const adminInfo = await getAdminRepo({ userId });
            if (!adminInfo) {
                res.status(404).json(createSingleResponse(userNotFoundResponseText));
            } else {
                const email = adminInfo.email;
                if (!isEmail(email)) {
                    res.status(404).json(createSingleResponse(cantFindValidEmailResponseText));
                } else {
                    const path = urls.passwordRecoveryPath;
                    const subject = "Password recovery";
                    const html = passwordRecoveryEmail;
                    await sendEmailVerification({ email, path, subject, html });
                    res.json(createSingleResponse(successResponseText));
                }
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};

exports.makeRecoverAdminPasswordCont = ({ getAdminRepo, recoverAdminPasswordHashRepo }) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const { recoveryToken, newPasswordHash } = req.body;
            if (!hasSingleValue(recoveryToken) || !hasSingleValue(newPasswordHash)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                const adminInfo = await getAdminRepo({ userId });
                if (!adminInfo) {
                    res.status(404).json(createSingleResponse(userNotFoundResponseText));
                } else {
                    let recoveryObject;
                    try {
                        // @ts-ignore
                        recoveryObject = jwt.verify(recoveryToken, env.JWT_SECRETE);
                    } catch (error) {
                        res.status(400).json(createSingleResponse(invalidTokenResponseText));
                        return;
                    }
                    if (new Date().getTime() > recoveryObject.validUntil) {
                        res.status(408).json(createSingleResponse(expiredTokenResponseText));
                    } else {
                        const emailFrom = recoveryObject.email;
                        const adminEmail = adminInfo.email;
                        if (emailFrom !== adminEmail) {
                            res.status(400).json(createSingleResponse(invalidTokenResponseText));
                        } else {
                            const result = await recoverAdminPasswordHashRepo({ userId, newPasswordHash });
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
};