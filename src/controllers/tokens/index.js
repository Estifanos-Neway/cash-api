const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { checkJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { errorHandler } = require("../controller-commons");
const { createAccessToken, singleResponse } = require("../controller-commons/functions");

const { makeRefreshTokenCont } = require("./refresh-token-cont");

module.exports = {
    refreshTokenCont: makeRefreshTokenCont(jwt, env, checkJwtRefreshRepo, createAccessToken, singleResponse, errorHandler)
};