const { admin } = require("../../entities");
const { adminsDb } = require("../../data-access/dbs");
const { makeSignInAdminRepo, makeSignUpAdminRepo } = require("./admin-repo");

module.exports = {
    signInAdminRepo: makeSignInAdminRepo(admin, adminsDb),
    signUpAdminRepo: makeSignUpAdminRepo(admin, adminsDb)
};