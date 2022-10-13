const { Admin } = require("../entities");
const { adminDbModel } = require("./db-models");
const { exists, create, findOne, count, updateOne, adaptEntity } = require("./db-commons/functions");

const idName = "userId";

module.exports = Object.freeze({
    exists: (conditions) => exists(adminDbModel, conditions),
    count: () => count(adminDbModel),
    create: async (admin) => {
        let result = await create(adminDbModel, admin.toJson());
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    findOne: async (conditions, select) => {
        let result = await findOne(adminDbModel, conditions, select);
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    updateOne: async (conditions, updates) => {
        let result = await updateOne(adminDbModel, conditions, updates);
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    }
});