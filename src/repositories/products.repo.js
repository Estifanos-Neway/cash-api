const _ = require("lodash");
const { removeUndefined } = require("../commons/functions");
const { productsDb } = require("../database");
const Product = require("../entities/product.model");
const { filesDb } = require("../database");

module.exports = Object.freeze({
    exists: async (condition) => await productsDb.exists(condition),
    create: async (jsonProduct) => {
        const product = new Product(jsonProduct);
        return await productsDb.create(product);
    },
    getMany: async ({ filter, categories, skip, limit, select, sort }) => {
        return await productsDb.findMany({ filter, categories, skip, limit, sort, select });
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
    delete: async (condition) => {
        const product = await productsDb.deleteOne(condition);
        if (product) {
            const filesToBeDeleted = [];
            const mainImagePath = product.mainImage?.path;
            if (mainImagePath) {
                const fileName = mainImagePath.substring(mainImagePath.lastIndexOf("/") + 1);
                filesToBeDeleted.push(fileName);
            }
            const moreImages = product.moreImages;
            if (_.isArray(moreImages)) {
                for (const image of moreImages) {
                    const imagePath = image.path;
                    const fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                    filesToBeDeleted.push(fileName);
                }
            }
            for (const fileName of filesToBeDeleted) {
                await filesDb.delete(fileName, filesDb.bucketNames.productImages);
            }
        }
    },
    isUniqueProductName: async (productName, productId) => {
        const productFound = await productsDb.exists({ productName });
        if (productFound) {
            return productFound.id == productId;
        } else {
            return true;
        }
    }
});