const { productsDb } = require("../database");
const Product = require("../entities/product.model");

exports.createProductRepo = async (jsonProduct) => {
    const product = new Product(jsonProduct);
    return await productsDb.create(product);
};

exports.getProductsRepo = async ({ filter, categories, skip, limit, sort }) => {
    return await productsDb.findMany({ filter, categories, skip, limit, sort });
};

exports.getProductRepo = async (productId, viewed = false) => {
    if (viewed) {
        return await productsDb.increment({ id: productId }, ["viewCount", 1]);
    } else {
        return await productsDb.findOne({ id: productId });
    }
};

exports.isUniqueProductName = async (productName, productId) => {
    const productFound = await productsDb.exists({ productName });
    if (productFound) {
        return productFound.id == productId;
    } else {
        return true;
    }
};