const { Admin } = require("../../entities");
const { adminsDb } = require("../../data-access");
const { makeSignInAdminRepo, makeSignUpAdminRepo, makeChangeAdminUsernameRepo, makeChangeAdminPasswordHashRepo, makeGetAdminRepo, makeUpdateAdminSettingsRepo } = require("./admin-repo");

module.exports = {
    signInAdminRepo: makeSignInAdminRepo({ Admin, adminsDb }),
    signUpAdminRepo: makeSignUpAdminRepo({ Admin, adminsDb }),
    changeAdminUsernameRepo: makeChangeAdminUsernameRepo({ adminsDb }),
    changeAdminPasswordHashRepo: makeChangeAdminPasswordHashRepo({ adminsDb }),
    getAdminRepo: makeGetAdminRepo({ adminsDb }),
    updateAdminSettingsRepo: makeUpdateAdminSettingsRepo({ adminsDb }),
};