const rt = require("../commons/response-texts");
const { ProductCategory } = require("../entities");
const { db } = require("./db.commons");
const { productCategoryDbModel } = require("./db-models");

const idName = "categoryId";

module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(productCategoryDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: () => db.count(productCategoryDbModel),
    create: async (category) => {
        try {
            const categoryDoc = await db.create(productCategoryDbModel, category.toJson());
            return db.adaptEntity(ProductCategory, categoryDoc, idName);
        } catch (error) {
            if (error.errors?.categoryName?.kind === "unique") {
                throw new Error(rt.categoryNameAlreadyExist);
            } else {
                throw error;
            }
        }
    },
    findOne: async (conditions) => {
        const categoryDoc = await db.findOne(productCategoryDbModel, conditions);
        return categoryDoc ? db.adaptEntity(ProductCategory, categoryDoc, idName) : null;
    },
    findMany: async () => {
        // @ts-ignore
        const categoryDocList = await db.findMany({ model: productCategoryDbModel });
        return categoryDocList.map(categoryDoc => db.adaptEntity(ProductCategory, categoryDoc, idName));
    },
    updateOne: async (conditions, updates) => {
        const categoryDoc = await db.updateOne(productCategoryDbModel, conditions, updates);
        return db.adaptEntity(ProductCategory, categoryDoc, idName);
    },
    deleteOne: async (conditions) => {
        const categoryDoc = await db.deleteOne(productCategoryDbModel, conditions);
        return categoryDoc ? db.adaptEntity(ProductCategory, categoryDoc, idName) : null;
    }
});