const rt = require("../commons/response-texts");
const { Affiliate } = require("../entities");
const { affiliateDbModel } = require("./db-models");
const { db } = require("./db.commons");

function catchUniquenessErrors(error) {
    if (error.errors?.email?.kind === "unique") {
        throw new Error(rt.affiliateEmailAlreadyExist);
    } else if (error.errors?.email?.kind === "phone") {
        throw new Error(rt.affiliatePhoneAlreadyExist);
    }
}
const idName = "userId";
module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(affiliateDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: async (conditions) => await db.count(affiliateDbModel, conditions),
    create: async (affiliate) => {
        try {
            const affiliateDoc = await db.create(affiliateDbModel, affiliate.toJson());
            return db.adaptEntity(Affiliate, affiliateDoc, idName);
        } catch (error) {
            catchUniquenessErrors(error);
            throw error;
        }
    },
    findOne: async (conditions, select) => {
        const affiliateDoc = await db.findOne(affiliateDbModel, conditions, select);
        return affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, idName) : null;
    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const affiliateDocList = await db.findMany({ model: affiliateDbModel, filter, skip, limit, select, sort });
        return affiliateDocList.map(affiliateDoc => db.adaptEntity(Affiliate, affiliateDoc, idName));
    },
    updateOne: async (conditions, updates) => {
        try {
            const affiliateDoc = await db.updateOne(affiliateDbModel, conditions, updates);
            return db.adaptEntity(Affiliate, affiliateDoc, idName);
        } catch (error) {
            catchUniquenessErrors(error);
            throw error;
        }
    },
    deleteOne: async (conditions) => {
        const affiliateDoc = await db.deleteOne(affiliateDbModel, conditions);
        return affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, idName) : null;
    }
});