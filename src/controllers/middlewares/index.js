const { singleResponse } = require("../controller-commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { makeAuthenticateByToken } = require("./authenticate-by-token");

module.exports = {
    authenticateByToken: makeAuthenticateByToken(env, singleResponse, jwt)
};