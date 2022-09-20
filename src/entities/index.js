const { invalidInput, requiredParamsNotFound } = require("../commons/variables");
const { makeAdmin } = require("./admin");

exports.admin = makeAdmin(invalidInput, requiredParamsNotFound);