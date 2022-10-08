const { Admin } = require("../entities");
const { adminDbModel } = require("./db-models");
const { exists, create, findOne, count, updateOne, adaptEntity } = require("./db-commons/functions");

const idName = "userId";

module.exports = Object.freeze({
    exists: (condition) => exists(adminDbModel, condition),
    count: () => count(adminDbModel),
    create: async (admin) => {
        let result = await create(adminDbModel, admin.toJson());
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    findOne: async (condition, selection) => {
        let result = await findOne(adminDbModel, condition, selection);
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    updateOne: async (condition, updates) => {
        let result = await updateOne(adminDbModel, condition, updates);
        if (result) {
            return adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    }
});