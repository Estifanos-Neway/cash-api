const { categoryNameAlreadyExistResponseText } = require("../commons/response-texts");
const { Category } = require("../entities");
const { create, findOne, findMany, adaptEntity } = require("./db-commons/functions");
const { categoryDbModel } = require("./db-models");

const idName = "categoryId";

module.exports = Object.freeze({
    create: async (category) => {
        try {
            const categoryDoc = await create(categoryDbModel, category.toJson());
            return adaptEntity(Category, categoryDoc, idName);
        } catch (error) {
            if (error.message == "not unique") {
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
        const categoryDocList = await findMany({ model: categoryDbModel });
        return categoryDocList.map(categoryDoc => adaptEntity(Category, categoryDoc, idName));
    }
});