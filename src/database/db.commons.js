const _ = require("lodash");
const mongoose = require("mongoose");
const utils = require("../commons/functions");

function adaptConditions(conditions = {}) {
    if (!_.isUndefined(conditions) && "id" in conditions && utils.isValidDbId(conditions.id)) {
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
        let doc = await model.findOne(conditions, null, options);
        if (doc) {
            Object.entries(updates).forEach(update => {
                if (update[0] in doc) {
                    doc[update[0]] = update[1];
                }
            });
            return await doc.save(options);
        } else {
            throw new Error(responses.docNotFound);
        }
    },
    increment: async (model, conditions = {}, incrementors = {}, options = {}) => {
        adaptConditions(conditions);
        const doc = await model.findOne(conditions, null, options);
        if (doc) {
            for (let [field, incBy] of Object.entries(incrementors)) {
                doc.$inc(field, incBy);
            }
            return await doc.save(options);
        } else {
            throw new Error(responses.docNotFound);
        }
    },
    DbSession: class {
        #session;
        get session() {
            return this.#session;
        }

        async startSession() {
            this.#session = await mongoose.startSession();
        }

        async withTransaction(transactions) {
            return await this.session.withTransaction(transactions);
        }

        async endSession() {
            this.#session.endSession();
        }

    },
    adaptEntity: (Entity, dbDoc, idName = "id") => {
        dbDoc = dbDoc.toJSON();
        dbDoc[idName] = dbDoc._id.toString();
        return new Entity(dbDoc);
    },
    sanitizeOptions: (options = {}) => {
        const { session } = options;
        options = { session };
    }
};