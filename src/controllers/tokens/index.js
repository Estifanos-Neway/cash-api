const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { checkJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { errorHandler } = require("../controller-commons");
const { createAccessToken, singleResponse } = require("../controller-commons/functions");
const { invalidAccessToken } = require("../../commons/variables");
const { successResponseText } = require("../controller-commons/variables");
const { deleteJwtRefreshRepo } = require("../../repositories/jwt-refresh");

const { makeRefreshTokenCont } = require("./refresh-token-cont");
const { makeSignOutCont } = require("./sign-out-cont");

module.exports = {
    refreshTokenCont: makeRefreshTokenCont(jwt, env, checkJwtRefreshRepo, createAccessToken, singleResponse, errorHandler, invalidAccessToken),
    signOutCont: makeSignOutCont(jwt, env, singleResponse, errorHandler, successResponseText, deleteJwtRefreshRepo)
};