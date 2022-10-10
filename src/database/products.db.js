const { productNameAlreadyExistResponseText } = require("../commons/response-texts");
const { findManyDefaultLimit } = require("../commons/variables");
const { Product } = require("../entities");
const {
    exists,
    create,
    findOne,
    findMany,
    count,
    updateOne,
    deleteOne,
    adaptEntity } = require("./db-commons/functions");
const { productDbModel } = require("./db-models");

const idName = "productId";

module.exports = Object.freeze({
    exists: (conditions) => exists(productDbModel, conditions),
    count: () => count(productDbModel),
    create: async (product) => {
        try {
            const productDoc = await create(productDbModel, product.toJson());
            return adaptEntity(Product, productDoc, idName);
        } catch (error) {
            if (error.message == "not unique") {
                throw new Error(productNameAlreadyExistResponseText);
            } else {
                throw error;
            }
        }
    },

    findOne: async (conditions, selection) => {
        const productDoc = await findOne(productDbModel, conditions, selection);
        if (productDoc) {
            return adaptEntity(Product, productDoc, idName);
        } else {
            return null;
        }
    },

    findMany: async ({ conditions = {}, filter = {}, selection = {}, skip = 0, limit = findManyDefaultLimit, sort = {} }) => {
        const productDocList = await findMany({ model: productDbModel, conditions, filter, skip, limit, selection, sort });
        const productList = [];
        for (const productDoc of productDocList) {
            productList.push(adaptEntity(Product, productDoc, idName));
        }
        return productList;
    },
    updateOne: async (conditions, updates) => {
        const productDoc = await updateOne(productDbModel, conditions, updates);
        return adaptEntity(Product, productDoc, idName);
    },

    deleteOne: (conditions) => deleteOne(productDbModel, conditions)
});