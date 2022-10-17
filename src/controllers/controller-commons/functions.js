const jwt = require("jsonwebtoken");
const {
    internalErrorResponseText,
    invalidInputResponseText,
    successResponseText,
    requiredParamsNotFoundResponseText } = require("../../commons/response-texts");
const { env } = require("../../env");
const {
    errorLog,
    encrypt,
    isNonEmptyString } = require("../../commons/functions");
const commonFunctions = require("../../commons/functions");
const { urls } = require("../../config.json");
const { accessTokenExpiresIn, verificationTokenExpiresIn } = require("../../commons/variables");

function createSingleResponse(response) {
    return { message: response };
}

function createUserData(userId, userType) {
    return { userId, userType, rand: Math.random() };
}

function createAccessToken(userData, expiresIn = `${accessTokenExpiresIn}m`) {
    // @ts-ignore
    return jwt.sign(userData, env.JWT_SECRETE, { expiresIn });
}

function getAccessToken(authHeader) {
    if (isNonEmptyString(authHeader)) {
        return authHeader.split(" ")[1];
    } else {
        return null;
    }
}

function sendSuccessResponse(res) {
    res.json(createSingleResponse(successResponseText));
}

function sendRequiredParamsNotFoundResponse(res) {
    res.status(400).json(createSingleResponse(requiredParamsNotFoundResponseText));
}

function sendInvalidInputResponse(res) {
    res.status(400).json(createSingleResponse(invalidInputResponseText));
}

function sendInternalErrorResponse(error, res) {
    errorLog("Internal_Error", error);
    res.status(500).json(createSingleResponse(internalErrorResponseText));
}

async function sendEmailVerificationCode({ email, subject, html }) {
    const verificationCode = commonFunctions["createVerificationCode"]();
    html = html.replaceAll("__verificationCode__", verificationCode);
    await commonFunctions["sendEmail"]({ subject, html, to: email });
    const validUntil = new Date().getTime() + verificationTokenExpiresIn * 60 * 1000;
    const verificationObject = { email, verificationCode, validUntil };
    return encrypt(verificationObject);
}

async function sendEmailVerification({ email, path, subject, html }) {
    const validUntil = new Date().getTime() + verificationTokenExpiresIn * 60 * 1000;
    const verificationObject = { email, validUntil };
    // @ts-ignore
    const verificationToken = jwt.sign(verificationObject, env.JWT_SECRETE);
    const verificationLink = `${urls.baseUrl}${path}?t=${verificationToken}`;
    html = html.replaceAll("__verificationLink__", verificationLink);
    await commonFunctions["sendEmail"]({ subject, html, to: email });
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
    createAccessToken,
    createUserData,
    getAccessToken,
    sendInvalidInputResponse,
    sendEmailVerificationCode,
    sendEmailVerification,
    sendInternalErrorResponse,
    sendSuccessResponse,
    sendRequiredParamsNotFoundResponse,
    catchInternalError
};