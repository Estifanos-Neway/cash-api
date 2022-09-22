const { singleResponse } = require("../controller-commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { makeAuthenticateByToken } = require("./authenticate-by-token");
const { invalidAccessToken } = require("../../commons/variables");
const { makeForceAccessToken } = require("./force-access-token");

module.exports = {
    authenticateByToken: makeAuthenticateByToken(env, singleResponse, jwt, invalidAccessToken),
    forceAccessToken: makeForceAccessToken(singleResponse)
};