const { exists, create, findOne, count } = require("../db-commons/functions");
const { updateOne } = require("../db-commons/functions");

function adaptAdmin(Admin, adminDoc) {
    adminDoc = adminDoc.toJSON();
    adminDoc.userId = adminDoc._id.toString();
    return new Admin(adminDoc);
}

exports.makeAdminsDb = function (Admin, dbConnector, adminModel) {
    return Object.freeze({
        exists: (condition) => exists(dbConnector, adminModel, condition),
        count: () => count(dbConnector, adminModel),
        create: async (admin) => {
            let result = await create(dbConnector, adminModel, admin.toJson());
            if (result) {
                return adaptAdmin(Admin, result);
            } else {
                return null;
            }
        },
        findOne: async (condition, selection) => {
            let result = await findOne(dbConnector, adminModel, condition, selection);
            if (result) {
                return adaptAdmin(Admin, result);
            } else {
                return null;
            }
        },
        updateOne: async (condition, updates) => {
            let result = await updateOne(dbConnector, adminModel, condition, updates);
            if (result) {
                return adaptAdmin(Admin, result);
            } else {
                return null;
            }
        }
    });
};