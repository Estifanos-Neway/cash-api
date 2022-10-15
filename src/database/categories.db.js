const { categoryNameAlreadyExistResponseText } = require("../commons/response-texts");
const { Category } = require("../entities");
const { adaptEntity, exists, count, create, findOne, findMany, updateOne, deleteOne } = require("./db-commons/functions");
const { categoryDbModel } = require("./db-models");

const idName = "categoryId";

module.exports = Object.freeze({
    exists: (conditions) => exists(categoryDbModel, conditions),
    count: () => count(categoryDbModel),
    create: async (category) => {
        try {
            const categoryDoc = await create(categoryDbModel, category.toJson());
            return adaptEntity(Category, categoryDoc, idName);
        } catch (error) {
            if (/^E11000/.test(error.message)) {
                throw new Error(categoryNameAlreadyExistResponseText);
            } else {
                throw error;
            }
        }
    },
    findOne: async (conditions) => {
        const categoryDoc = await findOne(categoryDbModel, conditions);
        return categoryDoc ? adaptEntity(Category, categoryDoc, idName) : null;
    },
    findMany: async () => {
        // @ts-ignore
        const categoryDocList = await findMany({ model: categoryDbModel });
        return categoryDocList.map(categoryDoc => adaptEntity(Category, categoryDoc, idName));
    },
    update: async (conditions, updates) => {
        const categoryDoc = await updateOne(categoryDbModel, conditions, updates);
        return adaptEntity(Category, categoryDoc, idName);
    },
    delete: async (conditions) => {
        const categoryDoc = await deleteOne(categoryDbModel, conditions);
        return categoryDoc ? adaptEntity(Category, categoryDoc, idName) : null;
    }
});