const { exists, create, findOne, count } = require("../db-commons/functions");
const { updateOne } = require("../db-commons/functions");

exports.makeAdminsDb = function (admin, dbConnector, adminModel) {
    return Object.freeze({
        exists: (condition) => exists(dbConnector, adminModel, condition),
        count: () => count(dbConnector, adminModel),
        create: (admin) => create(dbConnector, adminModel, admin),
        findOne: async (condition) => {
            const result = await findOne(dbConnector, adminModel, condition);
            if (result) {
                return admin(result.username, result.passwordHash, result.id);
            } else {
                return null;
            }
        },
        updateOne: (condition, updates) => updateOne(dbConnector, adminModel, condition, updates)
    });
};