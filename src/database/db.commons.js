const _ = require("lodash");
const mongoose = require("mongoose");

function adaptConditions(conditions = {}) {
    if (!_.isUndefined(conditions) && "id" in conditions && mongoose.Types.ObjectId.isValid(conditions.id)) {
        conditions._id = conditions.id;
        delete conditions.id;
    }
}
const responses = {
    docNotFound: "Doc_Not_Found"
};
exports.db = {
    responses,
    exists: async (model, conditions = {}, options = {}) => {
        adaptConditions(conditions);
        return await model.exists(conditions, options);
    },
    count: async (model, conditions = {}, options = {}) => {
        return await _.isEmpty(conditions) ? model.estimatedDocumentCount(options) : model.countDocuments(conditions, options);
    },
    create: async (model, doc, options = {}) => {
        const isDocArray = _.isArray(doc);
        doc = isDocArray ? doc : [doc];
        const createdDoc = await model.create(doc, options);
        return isDocArray ? createdDoc : createdDoc[0];
    },
    findOne: async (model, conditions = {}, select, options = {}) => {
        adaptConditions(conditions);
        return await model.findOne(conditions, null, options).select(select).exec();
    },
    findMany: async ({ model, conditions = {}, filter = {}, select = [], skip = 0, limit, sort = {}, options = {} }) => {
        adaptConditions(conditions);
        return await model.find(conditions, null, options).where(filter).select(select).skip(skip).limit(limit).sort(sort).exec();
    },
    deleteOne: async (model, conditions = {}, options = {}) => {
        adaptConditions(conditions);
        return await model.findOneAndDelete(conditions, options);
    },
    deleteMany: async (model, conditions = {}, options = {}) => {
        adaptConditions(conditions);
        return await model.deleteMany(conditions, options);
    },
    updateOne: async (model, conditions = {}, updates, options = {}) => {
        adaptConditions(conditions);
        options = { ...options, runValidators: true };
        return await model.updateOne(conditions, updates, options);
    },
    increment: async (model, conditions = {}, incrementor, options = {}) => {
        adaptConditions(conditions);
        const update = { $inc: incrementor };
        return await model.updateOne(conditions, update, options);
    },
    adaptEntity: (Entity, dbDoc, idName = "id") => {
        dbDoc = dbDoc.toJSON();
        dbDoc[idName] = dbDoc._id.toString();
        return new Entity(dbDoc);
    }
};