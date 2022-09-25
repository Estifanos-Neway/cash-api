const { signInAdminRepo, changeAdminPasswordHashRepo } = require("../../repositories/admin");
const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { changeAdminUsernameRepo } = require("../../repositories/admin");
const { makeSignInAdminCont } = require("./sign-in-admin-cont");
const { makeChangeAdminUsernameCont } = require("./change-admin-username-cont");
const { makeChangeAdminPasswordHashCont } = require("./change-admin-password-hash-cont");

module.exports = {
    signInAdminCont: makeSignInAdminCont(signInAdminRepo, addJwtRefreshRepo),
    changeAdminUsernameCont: makeChangeAdminUsernameCont(changeAdminUsernameRepo),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont(changeAdminPasswordHashRepo),
};