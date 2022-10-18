const _ = require("lodash");
const rt = require("../commons/response-texts");
const { Product } = require("../entities");
const { db } = require("./db.commons");
const { productDbModel } = require("./db-models");

const idName = "productId";

module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(productDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: () => db.count(productDbModel),
    create: async (product) => {
        try {
            const productDoc = await db.create(productDbModel, product.toJson());
            return db.adaptEntity(Product, productDoc, idName);
        } catch (error) {
            if (/^E11000/.test(error.message)) {
                throw new Error(rt.productNameAlreadyExist);
            } else {
                throw error;
            }
        }
    },
    findOne: async (conditions, select) => {
        const productDoc = await db.findOne(productDbModel, conditions, select);
        return productDoc ? db.adaptEntity(Product, productDoc, idName) : null;
    },
    findMany: async ({ filter = {}, categories = [], select = [], skip = 0, limit, sort = {} }) => {
        const productDocList = await db.findMany({ model: productDbModel, conditions: _.isEmpty(categories) ? {} : { categories: { $all: categories } }, filter, skip, limit, select, sort });
        return productDocList.map(productDoc => db.adaptEntity(Product, productDoc, idName));
    },
    updateOne: async (conditions, updates) => {
        const productDoc = await db.updateOne(productDbModel, conditions, updates);
        return db.adaptEntity(Product, productDoc, idName);
    },
    deleteOne: async (conditions) => {
        const productDoc = await db.deleteOne(productDbModel, conditions);
        return productDoc ? db.adaptEntity(Product, productDoc, idName) : null;
    },
    increment: async (conditions, incrementor) => {
        const productDoc = await db.increment(productDbModel, conditions, incrementor);
        return productDoc ? db.adaptEntity(Product, productDoc, idName) : null;
    }
});