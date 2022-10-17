const { categoryNotFoundResponseText } = require("../commons/response-texts");
const { productCategoriesDb, db } = require("../database");
const { ProductCategory } = require("../entities");

module.exports = Object.freeze({
    exists: async (condition) => await productCategoriesDb.exists(condition),
    create: async (jsonCategory) => {
        const category = new ProductCategory(jsonCategory);
        return await productCategoriesDb.create(category);
    },
    getOne: async (categoryId) => {
        return await productCategoriesDb.findOne({ id: categoryId });
    },
    getMany: async () => {
        return await productCategoriesDb.findMany();
    },
    update: async (categoryId, updates) => {
        try {
            const category = new ProductCategory(updates);
            return await productCategoriesDb.updateOne({ id: categoryId }, category.toJson());
        } catch (error) {
            throw error.message === db.responses.docNotFound ? new Error(categoryNotFoundResponseText) : error;
        }
    },
    delete: async (categoryId) => {
        return await productCategoriesDb.deleteOne({ id: categoryId });
    },
    isUniqueCategoryName: async (categoryName, categoryId) => {
        const categoryFound = await productCategoriesDb.exists({ categoryName });
        if (categoryFound) {
            return categoryFound.categoryId === categoryId;
        } else {
            return true;
        }
    }
});