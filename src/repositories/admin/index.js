const { Admin } = require("../../entities");
const { adminsDb } = require("../../data-access");
const { makeSignInAdminRepo, makeSignUpAdminRepo, makeChangeAdminUsernameRepo, makeChangeAdminPasswordHashRepo } = require("./admin-repo");

module.exports = {
    signInAdminRepo: makeSignInAdminRepo({ Admin, adminsDb }),
    signUpAdminRepo: makeSignUpAdminRepo({ Admin, adminsDb }),
    changeAdminUsernameRepo: makeChangeAdminUsernameRepo({ adminsDb }),
    changeAdminPasswordHashRepo: makeChangeAdminPasswordHashRepo({ adminsDb })
};