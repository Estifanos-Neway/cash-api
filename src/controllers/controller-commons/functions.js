/* eslint-disable indent */
const multer = require("multer");
const streamifier = require("streamifier");
const jwt = require("jsonwebtoken");
const rt = require("../../commons/response-texts");
const sc = require("./status-codes");
const { env } = require("../../env");
const utils = require("../../commons/functions");
const { urls } = require("../../configs");
const { verificationTokenExpiresIn } = require("../../commons/variables");

function createSingleResponse(response) {
    return { message: response };
}

function sendInternalErrorResponse(error, res) {
    utils.errorLog("Internal_Error", error);
    res.status(sc.internalError).json(createSingleResponse(rt.internalError));
}

async function catchInternalError(res, task) {
    try {
        await task();
    } catch (error) {
        sendInternalErrorResponse(error, res);
    }
}
function sendInvalidInputResponse(res) {
    res.status(sc.invalidInput).json(createSingleResponse(rt.invalidInput));
}
module.exports = {
    createSingleResponse,
    getAccessToken: (authHeader) => {
        if (utils.isNonEmptyString(authHeader)) {
            return authHeader.split(" ")[1];
        } else {
            return null;
        }
    },
    sendEmailVerificationCode: async ({ email, subject, html }) => {
        const verificationCode = utils["createVerificationCode"]();
        html = utils.replaceAll(html, "__verificationCode__", verificationCode);
        await utils["sendEmail"]({ subject, html, to: email });
        const validUntil = new Date().getTime() + verificationTokenExpiresIn;
        const verificationObject = { email, verificationCode, validUntil };
        return utils.encrypt(JSON.stringify(verificationObject));
    },
    sendEmailVerification: async ({ email, path, subject, html }) => {
        const validUntil = new Date().getTime() + verificationTokenExpiresIn;
        const verificationObject = { email, validUntil };
        // @ts-ignore
        const verificationToken = jwt.sign(verificationObject, env.JWT_SECRETE);
        const verificationLink = `${urls.baseUrl}${path}?u=admin&t=${verificationToken}`;
        html = utils.replaceAll(html, "__verificationLink__", verificationLink);
        await utils["sendEmail"]({ subject, html, to: email });
    },
    sendSuccessResponse: (res) => {
        res.json(createSingleResponse(rt.success));
    },
    sendInvalidInputResponse,
    sendRequiredParamsNotFoundResponse: (res) => {
        res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
    },
    sendUnauthorizedResponse: (res) => {
        res.status(sc.unauthorized).json(createSingleResponse(rt.unauthorized));
    },
    sendInternalErrorResponse,
    catchInternalError,
    createCatchSingleImageMid: ({ imageFieldName }) => {
        return async (req, res, next) => {
            const catchSingleImageMid = multer().single(imageFieldName);
            catchSingleImageMid(req, res, (error) => {
                catchInternalError(res, async () => {
                    if (error && error.message !== "Unexpected field") {
                        if (error.message === "Unexpected end of form") {
                            sendInvalidInputResponse(res);
                        } else {
                            throw error;
                        }
                    } else {
                        const imageBuffer = req.file?.buffer;
                        if (imageBuffer) {
                            if (!utils.isImageMime(req.file.mimetype)) {
                                res.status(sc.invalidInput).json(createSingleResponse(rt.invalidFileFormat));
                            } else {
                                const imageReadStream = streamifier.createReadStream(imageBuffer);
                                next(imageReadStream);
                            }
                        } else {
                            next(null);
                        }
                    }
                });
            });
        };
    }
};