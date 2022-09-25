const { admin } = require("../../entities");
const { adminsDb } = require("../../data-access");
const { makeSignInAdminRepo, makeSignUpAdminRepo, makeChangeAdminUsernameRepo, makeChangeAdminPasswordHashRepo } = require("./admin-repo");

module.exports = {
    signInAdminRepo: makeSignInAdminRepo(admin, adminsDb),
    signUpAdminRepo: makeSignUpAdminRepo(admin, adminsDb),
    changeAdminUsernameRepo: makeChangeAdminUsernameRepo(adminsDb),
    changeAdminPasswordHashRepo: makeChangeAdminPasswordHashRepo(adminsDb)
};