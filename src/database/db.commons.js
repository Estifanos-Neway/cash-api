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
    exists: async (model, conditions = {}) => {
        adaptConditions(conditions);
        return await model.exists(conditions);
    },
    count: async (model) => {
        return await model.count();
    },
    create: async (model, doc) => {
        return await model.create(doc);
    },
    findOne: async (model, conditions = {}, select) => {
        adaptConditions(conditions);
        return await model.findOne(conditions).select(select).exec();
    },
    findMany: async ({ model, conditions = {}, filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        adaptConditions(conditions);
        return await model.find(conditions).where(filter).select(select).skip(skip).limit(limit).sort(sort).exec();
    },
    deleteOne: async (model, conditions = {}) => {
        adaptConditions(conditions);
        return await model.findOneAndDelete(conditions);
    },
    updateOne: async (model, conditions = {}, updates) => {
        adaptConditions(conditions);
        let doc = await model.findOne(conditions);
        if (doc) {
            Object.entries(updates).forEach(update => {
                if (update[0] in doc) {
                    doc[update[0]] = update[1];
                }
            });
            return await doc.save();
        } else {
            throw new Error(responses.docNotFound);
        }
    },
    increment: async (model, conditions = {}, incrementor) => {
        adaptConditions(conditions);
        const doc = await model.findOne(conditions);
        if (doc) {
            doc.$inc(...incrementor);
            return await doc.save();
        } else {
            throw new Error(responses.docNotFound);
        }
    },
    adaptEntity: (Entity, dbDoc, idName = "id") => {
        dbDoc = dbDoc.toJSON();
        dbDoc[idName] = dbDoc._id.toString();
        return new Entity(dbDoc);
    }
};