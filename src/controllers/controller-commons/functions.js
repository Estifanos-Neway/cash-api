const jwt = require("jsonwebtoken");
const { invalidInput } = require("../../commons/variables");
const { env } = require("../../env");
const { internalError } = require("./variables");

function createSingleResponse(response) {
    return JSON.stringify({ message: response });
}

function createUserData(userId, userType) {
    return { userId, userType };
}

function createAccessToken(userData) {
    // @ts-ignore
    return jwt.sign(userData, env.JWT_SECRETE, { expiresIn: "10m" });
}

function getAccessToken(authHeader) {
    return authHeader && authHeader.split(" ")[1];
}

function errorHandler(error, res) {
    const errorMessage = error.message;
    if (errorMessage.startsWith(invalidInput)) {
        res.status(400).end(createSingleResponse(errorMessage.slice(invalidInput.length)));
    } else {
        console.dir(error, { depth: null });
        res.status(500).end(createSingleResponse(internalError));
    }
}

module.exports = {
    createSingleResponse,
    createAccessToken,
    createUserData,
    getAccessToken,
    errorHandler
};