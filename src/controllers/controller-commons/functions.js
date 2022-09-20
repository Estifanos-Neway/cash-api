const jwt = require("jsonwebtoken");
const { env } = require("../../env");

function singleResponse(response) {
    return JSON.stringify({ message: response });
}

function createAccessToken(data) {
    // @ts-ignore
    return jwt.sign(data, env.JWT_SECRETE, { expiresIn: "10m" });
}

module.exports = {
    singleResponse,
    createAccessToken
};