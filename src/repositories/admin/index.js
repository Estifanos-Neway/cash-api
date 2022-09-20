const { adminsDb } = require("../../data-access");
const { makeSigninAdmin } = require("./signin-admin");

exports.signinAdmin = makeSigninAdmin(adminsDb);