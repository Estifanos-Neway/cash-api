const { hasValue, decrypt, isEmail } = require("../../commons/functions");
const { requiredParamsNotFoundResponseText, invalidEmailResponseText, invalidVerificationCodeResponseText, expiredVerificationTokenResponseText, invalidVerificationTokenResponseText } = require("../../commons/variables");
const { errorHandler, createUserData, createAccessToken, createSingleResponse } = require("../controller-commons/functions");
const { successResponseText, notFound } = require("../controller-commons/variables");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { updateAdminEmailRepo } = require("../../repositories/admin");

exports.makeSignInAdminCont = ({ signInAdminRepo, addJwtRefreshRepo }) => {
    return async (req, res) => {
        try {
            const { username, passwordHash } = req.body;
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
                res.end(JSON.stringify(response));
            } else {
                res.status(404).end(createSingleResponse(notFound));
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
                res.end(JSON.stringify(adminInfo));
            } else {
                res.status(404).end(createSingleResponse(notFound));
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
                res.end(JSON.stringify(adminSettings));
            } else {
                res.status(404).end(createSingleResponse(notFound));
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
            if (!hasValue(oldPasswordHash) || !hasValue(newPasswordHash)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const result = await changeAdminPasswordHashRepo({ userId, oldPasswordHash, newPasswordHash });
                if (result.success) {
                    res.end(createSingleResponse(successResponseText));
                } else {
                    res.status(400).end(createSingleResponse(result.result));
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
            const newUsername = req.body.newUsername;
            if (!hasValue(newUsername)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const result = await changeAdminUsernameRepo({ userId, newUsername });
                if (result.success) {
                    res.end(createSingleResponse(successResponseText));
                } else {
                    res.status(400).end(createSingleResponse(result.result));
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
            if (!hasValue(updates)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const result = await updateAdminSettingsRepo({ userId, updates });
                if (result.success) {
                    res.end(JSON.stringify(result.result));
                } else {
                    res.status(400).end(createSingleResponse(result.result));
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
            if (!hasValue(newEmail)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
                // @ts-ignore
            } else if (!isEmail(newEmail)) {
                res.status(400).end(createSingleResponse(invalidEmailResponseText));
            } else {
                const verificationToken = await sendEmailVerificationCode(newEmail);
                res.end(JSON.stringify({ verificationToken }));
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
            if (!hasValue(verificationCode) || !hasValue(verificationToken)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const decrypted = decrypt(verificationToken);
                let verificationObject;
                try {
                    verificationObject = JSON.parse(decrypted);
                } catch (error) {
                    res.status(400).end(createSingleResponse(invalidVerificationTokenResponseText));
                    return;
                }
                if (new Date().getTime() > verificationObject.validUntil) {
                    res.status(400).end(createSingleResponse(expiredVerificationTokenResponseText));
                } else if (verificationCode !== verificationObject.verificationCode) {
                    res.status(400).end(createSingleResponse(invalidVerificationCodeResponseText));
                    // @ts-ignore
                } else if (!isEmail(verificationObject.email)) {
                    res.status(400).end(createSingleResponse(invalidVerificationTokenResponseText));
                } else {
                    const result = await updateAdminEmailRepo({ userId, email: verificationObject.email });
                    if (result.success) {
                        res.end(JSON.stringify({ newEmail: result.result }));
                    } else {
                        res.status(400).end(createSingleResponse(result.result));
                    }
                }
            }
        } catch (error) {
            if (error.message === "Malformed UTF-8 data") {
                res.status(400).end(createSingleResponse(invalidVerificationTokenResponseText));
            } else {
                errorHandler(error, res);
            }
        }
    };
};