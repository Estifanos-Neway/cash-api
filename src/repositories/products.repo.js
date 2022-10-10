const { removeUndefined } = require("../commons/functions");
const { productsDb } = require("../database");
const Product = require("../entities/product.model");

module.exports = Object.freeze({
    create: async (jsonProduct) => {
        const product = new Product(jsonProduct);
        return await productsDb.create(product);
    },
    getMany: async ({ filter, categories, skip, limit, sort }) => {
        return await productsDb.findMany({ filter, categories, skip, limit, sort });
    },
    getOne: async (productId, viewed = false) => {
        if (viewed) {
            return await productsDb.increment({ id: productId }, ["viewCount", 1]);
        } else {
            return await productsDb.findOne({ id: productId });
        }
    },
    update: async (productId, updates) => {
        const product = new Product(updates);
        return await productsDb.updateOne({ id: productId }, removeUndefined(product.toJson()));
    },
    exists: async (condition) => await productsDb.exists(condition),
    isUniqueProductName: async (productName, productId) => {
        const productFound = await productsDb.exists({ productName });
        if (productFound) {
            return productFound.id == productId;
        } else {
            return true;
        }
    }
});