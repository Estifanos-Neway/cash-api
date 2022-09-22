const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { signInAdminRepo } = require("../../repositories/admin");
const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { errorHandler } = require("../controller-commons");
const { singleResponse, createAccessToken } = require("../controller-commons/functions");
const { notFound } = require("../controller-commons/variables");
const { changeAdminUsernameRepo } = require("../../repositories/admin");

const { makeSignInAdminCont } = require("./sign-in-admin-cont");
const { createUserData } = require("../controller-commons/functions");
const { makeChangeAdminUsernameCont } = require("./change-admin-username-cont");

module.exports = {
    signInAdminCont: makeSignInAdminCont(jwt, env, signInAdminRepo, addJwtRefreshRepo, errorHandler, singleResponse, createAccessToken, notFound, createUserData),
    changeAdminUsernameCont: makeChangeAdminUsernameCont(changeAdminUsernameRepo)
};