const { adminsDb } = require("../../data-access");
const signinAdmin = require("./signin-admin");

exports.signinAdmin = signinAdmin(adminsDb);