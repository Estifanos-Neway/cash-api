const { productsDb } = require("../database");
const Product = require("../entities/product.model");

exports.createProductRepo = async (jsonProduct) => {
    const product = new Product(jsonProduct);
    return await productsDb.create(product);
};

exports.getProductsRepo = async ({ filter, skip, limit, sort }) => {
    return await productsDb.findMany({ filter, skip, limit, sort });
};

exports.getProductRepo = async (productId) => {
    return await productsDb.findOne({ id: productId });
};

exports.isUniqueProductName = async (productName, productId) => {
    const productFound = await productsDb.exists({ productName });
    if (productFound) {
        return productFound.id == productId;
    } else {
        return true;
    }
};