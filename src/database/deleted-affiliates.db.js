const { DeletedAffiliate } = require("../entities");
const { deletedAffiliateDbModel } = require("./db-models");
const { db } = require("./db.commons");

const idName = "deletedAffiliateId";
module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(deletedAffiliateDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: async (conditions) => await db.count(deletedAffiliateDbModel, conditions),
    findOne: async (conditions, select) => {
        const deletedAffiliateDoc = await db.findOne(deletedAffiliateDbModel, conditions, select);
        return deletedAffiliateDoc ? db.adaptEntity(DeletedAffiliate, deletedAffiliateDoc, idName) : null;
    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const deletedAffiliateDocList = await db.findMany({ model: deletedAffiliateDbModel, filter, skip, limit, select, sort });
        return deletedAffiliateDocList.map(deletedAffiliateDoc => db.adaptEntity(DeletedAffiliate, deletedAffiliateDoc, idName));
    }
});