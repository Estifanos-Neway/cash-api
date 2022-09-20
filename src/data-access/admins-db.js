const { exists } = require("./db-commons/functions");
const { adminModel } = require("./db-models");

exports.makeAdminsDb = function (dbConnector) {
    return Object.freeze({
        exists: async (doc) => exists(dbConnector, adminModel, doc),
    });
};