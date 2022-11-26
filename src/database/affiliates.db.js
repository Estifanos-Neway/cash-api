const mongoose = require("mongoose");
const rt = require("../commons/response-texts");
const { Affiliate } = require("../entities");
const { affiliateDbModel, deletedAffiliateDbModel, sessionDbModel } = require("./db-models");
const { db } = require("./db.commons");

function catchUniquenessErrors(error) {
    if (error.errors?.email?.kind === "unique") {
        throw new Error(rt.affiliateEmailAlreadyExist);
    } else if (error.errors?.phone?.kind === "unique") {
        throw new Error(rt.affiliatePhoneAlreadyExist);
    }
}
const idName = Affiliate.idName;
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
    create: async (affiliate, options) => {
        db.sanitizeOptions(options);
        try {
            const affiliateDoc = await db.create(affiliateDbModel, affiliate.toJson(), options);
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
    updateOne: async (conditions, updates, options) => {
        db.sanitizeOptions(options);
        try {
            const affiliateDoc = await db.updateOne(affiliateDbModel, conditions, updates, options);
            return db.adaptEntity(Affiliate, affiliateDoc, idName);
        } catch (error) {
            catchUniquenessErrors(error);
            throw error;
        }
    },
    deleteOne: async (conditions) => {
        const session = await mongoose.startSession();
        let affiliate;
        await session.withTransaction(async () => {
            const affiliateDoc = await db.deleteOne(affiliateDbModel, conditions, { session });
            if (!affiliateDoc) {
                affiliate = null;
            } else {
                await db.deleteMany(sessionDbModel, { "user.userId": affiliateDoc._id }, { session });
                await db.create(deletedAffiliateDbModel, { affiliate: affiliateDoc }, { session });
                affiliate = db.adaptEntity(Affiliate, affiliateDoc, idName);
            }
        });
        await session.endSession();
        return affiliate;
    },
    increment: async (conditions, incrementors, options) => {
        db.sanitizeOptions(options);
        const affiliateDoc = await db.increment(affiliateDbModel, conditions, incrementors, options);
        return affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, idName) : null;
    },
    getSum: async (conditions, sumOf, options) => {
        db.sanitizeOptions(options);
        return await db.getSum(affiliateDbModel, conditions, sumOf, options);
    }
});