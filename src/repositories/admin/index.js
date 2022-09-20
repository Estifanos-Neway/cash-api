const { admin } = require("../../entities");
const { adminsDb } = require("../../data-access/dbs");
const { makeSignInAdmin, makeSignUpAdmin } = require("./admin-repo");

module.exports = {
    signInAdmin: makeSignInAdmin(admin, adminsDb),
    signUpAdmin: makeSignUpAdmin(admin, adminsDb)
};