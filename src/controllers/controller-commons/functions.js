const jwt = require("jsonwebtoken");
const {
    invalidInput,
    internalErrorResponseText,
    verificationTokenExpiresIn } = require("../../commons/variables");
const { env } = require("../../env");
const {
    createVerificationCode,
    sendEmail,
    encrypt,
    isNonEmptyString } = require("../../commons/functions");
const { urls } = require("../../config.json");

function createSingleResponse(response) {
    return JSON.stringify({ message: response });
}

function createUserData(userId, userType) {
    return { userId, userType };
}

function createAccessToken(userData, expiresIn = "10m") {
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

function errorHandler(error, res) {
    const errorMessage = error.message;
    if (errorMessage.startsWith(invalidInput)) {
        res.status(400).end(createSingleResponse(errorMessage.slice(invalidInput.length)));
    } else {
        console.dir(error, { depth: null });
        res.status(500).end(createSingleResponse(internalErrorResponseText));
    }
}

async function sendEmailVerificationCode({ email, subject, html }) {
    const verificationCode = createVerificationCode();
    html = html.replaceAll("__verificationCode__", verificationCode);
    await sendEmail({ subject, html, to: email });
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
    await sendEmail({ subject, html, to: email });
    console.log(verificationLink);
}

module.exports = {
    createSingleResponse,
    createAccessToken,
    createUserData,
    getAccessToken,
    errorHandler,
    sendEmailVerificationCode,
    sendEmailVerification
};