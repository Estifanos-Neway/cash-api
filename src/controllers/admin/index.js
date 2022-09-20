const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { signInAdminRepo } = require("../../repositories/admin");
const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { errorHandler } = require("../controller-commons");
const { singleResponse, createAccessToken } = require("../controller-commons/functions");
const { notFound } = require("../controller-commons/variables");

const { makeSignInAdminCont } = require("./sign-in-admin-controller");

module.exports = {
    signInAdminCont: makeSignInAdminCont(jwt, env, signInAdminRepo, addJwtRefreshRepo, errorHandler, singleResponse, createAccessToken, notFound)
};