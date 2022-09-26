const { exists, create, findOne, count } = require("../db-commons/functions");
const { updateOne } = require("../db-commons/functions");

exports.makeAdminsDb = function (Admin, dbConnector, adminModel) {
    return Object.freeze({
        exists: (condition) => exists(dbConnector, adminModel, condition),
        count: () => count(dbConnector, adminModel),
        create: (admin) => create(dbConnector, adminModel, admin.toJson()),
        findOne: async (condition) => {
            const result = await findOne(dbConnector, adminModel, condition);
            if (result) {
                const admin = new Admin(
                    {
                        username: result.username,
                        passwordHash: result.passwordHash,
                        userId: result.id
                    }
                );
                return admin;
            } else {
                return null;
            }
        },
        updateOne: (condition, updates) => updateOne(dbConnector, adminModel, condition, updates)
    });
};