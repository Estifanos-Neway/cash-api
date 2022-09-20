const jwt = require("jsonwebtoken");
const { env } = require("../../env");

function singleResponse(response) {
    return JSON.stringify({ message: response });
}
function createUserData(userId, userType){
    return {userId, userType};
}
function createAccessToken(userData) {
    // @ts-ignore
    return jwt.sign(userData, env.JWT_SECRETE, { expiresIn: "10m" });
}

module.exports = {
    singleResponse,
    createAccessToken,
    createUserData
};