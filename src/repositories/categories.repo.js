const { categoriesDb } = require("../database");
const { Category } = require("../entities");

module.exports = Object.freeze({
    exists: async (condition) => await categoriesDb.exists(condition),
    create: async (jsonCategory) => {
        const category = new Category(jsonCategory);
        return await categoriesDb.create(category);
    },
    getOne: async (categoryId) => {
        return await categoriesDb.findOne({ id: categoryId });
    },
    getMany: async () => {
        return await categoriesDb.findMany();
    },
    update: async (categoryId, updates) => {
        const category = new Category(updates);
        return await categoriesDb.update({ id: categoryId }, category.toJson());
    },
    delete: async (categoryId) => {
        return await categoriesDb.delete({ id: categoryId });
    },
    isUniqueCategoryName: async (categoryName, categoryId) => {
        const categoryFound = await categoriesDb.exists({ categoryName });
        if (categoryFound) {
            return categoryFound.id === categoryId;
        } else {
            return true;
        }
    }
});