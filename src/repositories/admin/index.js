const { Admin } = require("../../entities");
const { adminsDb } = require("../../data-access");
const {
    makeSignInAdminRepo,
    makeSignUpAdminRepo,
    makeChangeAdminUsernameRepo,
    makeChangeAdminPasswordHashRepo,
    makeGetAdminRepo,
    makeUpdateAdminSettingsRepo,
    makeGetAdminSettingsRepo } = require("./admin-repo");

module.exports = {
    signInAdminRepo: makeSignInAdminRepo({ Admin, adminsDb }),
    signUpAdminRepo: makeSignUpAdminRepo({ Admin, adminsDb }),
    getAdminRepo: makeGetAdminRepo({ adminsDb }),
    getAdminSettingsRepo: makeGetAdminSettingsRepo({ adminsDb }),
    changeAdminUsernameRepo: makeChangeAdminUsernameRepo({ adminsDb }),
    changeAdminPasswordHashRepo: makeChangeAdminPasswordHashRepo({ adminsDb }),
    updateAdminSettingsRepo: makeUpdateAdminSettingsRepo({ adminsDb }),
};