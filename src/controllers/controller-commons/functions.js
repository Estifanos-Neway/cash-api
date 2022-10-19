const jwt = require("jsonwebtoken");
const rt = require("../../commons/response-texts");
const { env } = require("../../env");
const utils = require("../../commons/functions");
const { urls } = require("../../config.json");
const { verificationTokenExpiresIn } = require("../../commons/variables");

function createSingleResponse(response) {
    return { message: response };
}

function getAccessToken(authHeader) {
    if (utils.isNonEmptyString(authHeader)) {
        return authHeader.split(" ")[1];
    } else {
        return null;
    }
}

function sendSuccessResponse(res) {
    res.json(createSingleResponse(rt.success));
}

function sendRequiredParamsNotFoundResponse(res) {
    res.status(400).json(createSingleResponse(rt.requiredParamsNotFound));
}

function sendInvalidInputResponse(res) {
    res.status(400).json(createSingleResponse(rt.invalidInput));
}

function sendInternalErrorResponse(error, res) {
    utils.errorLog("Internal_Error", error);
    res.status(500).json(createSingleResponse(rt.internalError));
}

async function sendEmailVerificationCode({ email, subject, html }) {
    const verificationCode = utils["createVerificationCode"]();
    html = html.replaceAll("__verificationCode__", verificationCode);
    await utils["sendEmail"]({ subject, html, to: email });
    const validUntil = new Date().getTime() + verificationTokenExpiresIn;
    const verificationObject = { email, verificationCode, validUntil };
    return utils.encrypt(JSON.stringify(verificationObject));
}

async function sendEmailVerification({ email, path, subject, html }) {
    const validUntil = new Date().getTime() + verificationTokenExpiresIn;
    const verificationObject = { email, validUntil };
    // @ts-ignore
    const verificationToken = jwt.sign(verificationObject, env.JWT_SECRETE);
    const verificationLink = `${urls.baseUrl}${path}?t=${verificationToken}`;
    html = html.replaceAll("__verificationLink__", verificationLink);
    await utils["sendEmail"]({ subject, html, to: email });
}


async function catchInternalError(res, task) {
    try {
        await task();
    } catch (error) {
        sendInternalErrorResponse(error, res);
    }
}
module.exports = {
    createSingleResponse,
    getAccessToken,
    sendInvalidInputResponse,
    sendEmailVerificationCode,
    sendEmailVerification,
    sendInternalErrorResponse,
    sendSuccessResponse,
    sendRequiredParamsNotFoundResponse,
    catchInternalError
};