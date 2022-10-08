const { productNameAlreadyExistResponseText } = require("../commons/response-texts");
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
    exists: (condition) => exists(productDbModel, condition),
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
    findOne: async (condition, selection) => {
        const productDoc = await findOne(productDbModel, condition, selection);
        return adaptEntity(Product, productDoc, idName);
    },
    findMany: async ({ condition, selection, sort }) => {
        const productDocList = await findMany({ model: productDbModel, condition, selection, sort });
        const productList = [];
        for (const productDoc of productDocList) {
            productList.push(adaptEntity(Product, productDoc, idName));
        }
        return productList;
    },
    updateOne: async (condition, updates) => {
        const productDoc = await updateOne(productDbModel, condition, updates);
        return adaptEntity(Product, productDoc, idName);
    },
    deleteOne: (condition) => deleteOne(productDbModel, condition)
});