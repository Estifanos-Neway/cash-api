const { exists } = require("./commons");
const { admin } = require("./db-schemas");

module.exports = function (dbConnector) {
    return async function () {
        return Object.freeze({
            exists: async (doc) => exists(dbConnector, admin, doc),
        });
    };
};