const flat = require("flat");
const _ = require("lodash");
const mongoose = require("mongoose");
const utils = require("../commons/functions");

function adaptConditions(conditions = {}) {
    if (!_.isUndefined(conditions) && "id" in conditions && utils.isValidDbId(conditions.id)) {
        conditions._id = conditions.id;
        delete conditions.id;
    }
}
function adaptFilter(filter) {
    if (filter.or) {
        if (!_.isEmpty(filter.or)) {
            filter.$or = [];
            for (const [key, value] of Object.entries(filter.or)) {
                filter.$or.push({ [key]: value });
            }
        }
        delete filter.or;
    }
    return filter;
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
        adaptFilter(filter);
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
        const updateOptions = { ...options, runValidators: true, returnDocument: "after" };
        // @ts-ignore
        const _flattenedUpdates = flat(updates,{safe: true});
        const flattenedUpdates = { $unset: {} };
        for (let [key, value] of Object.entries(_flattenedUpdates)) {
            if (_.isUndefined(value)) {
                flattenedUpdates.$unset[key] = 1;
            } else {
                flattenedUpdates[key] = value;
            }
        }
        const doc = await model.findOneAndUpdate(conditions, flattenedUpdates, updateOptions);
        if (doc) {
            return doc;
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
    getSum: async (model, conditions = {}, sumOf, options = {}) => {
        adaptConditions(conditions);
        const result = await model.aggregate(
            [
                { $match: conditions },
                { $group: { _id: null, sum: { $sum: `$${sumOf}` } } }
            ],
            options
        );
        return result[0]?.sum ?? 0;
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