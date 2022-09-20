exports.makeAdminsDb = function (admin, dbConnector, adminModel, exists, count, create, findOne) {
    return Object.freeze({
        exists: (condition) => exists(dbConnector, adminModel, condition),
        count: () => count(dbConnector, adminModel),
        create: (admin) => create(dbConnector, adminModel, admin),
        findOne: async (condition) => {
            const result = await findOne(dbConnector, adminModel, condition);
            if (result) {
                return admin(result.username, result.passwordHash);
            } else {
                return null;
            }
        }
    });
};