const { Admin } = require("../entities");
const { adminDbModel } = require("./db-models");
const { db } = require("./db.commons");

const idName = "userId";

module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(adminDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: () => db.count(adminDbModel),
    create: async (admin) => {
        let result = await db.create(adminDbModel, admin.toJson());
        if (result) {
            return db.adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    findOne: async (conditions, select) => {
        let result = await db.findOne(adminDbModel, conditions, select);
        if (result) {
            return db.adaptEntity(Admin, result, idName);
        } else {
            return null;
        }
    },
    updateOne: async (conditions, updates) => {
        let result = await db.updateOne(adminDbModel, conditions, updates);
        return db.adaptEntity(Admin, result, idName);
    }
});