const mongoose = require("mongoose");
const { findManyDefaultLimit } = require("../../commons/variables");

function adaptConditions(conditions) {
    if ("id" in conditions && mongoose.Types.ObjectId.isValid(conditions.id)) {
        conditions._id = conditions.id;
        delete conditions.id;
    }
}

async function exists(model, conditions) {
    adaptConditions(conditions);
    const documentFound = await model.exists(conditions);
    if (documentFound) {
        documentFound.id = documentFound._id.toString();
        return documentFound;
    } else {
        return false;
    }
}

async function count(model) {
    return await model.count();
}

async function create(model, doc) {
    return await model.create(doc);
}

async function findOne(model, conditions, selection) {
    adaptConditions(conditions);
    return await model.findOne(conditions).select(selection).exec();
}

async function findMany({ model, conditions = {}, filter = {}, selection = {}, skip = 0, limit = findManyDefaultLimit, sort = {} }) {
    adaptConditions(conditions);
    return await model.find(conditions).where(filter).select(selection).skip(skip).limit(limit).sort(sort).exec();
}

async function deleteOne(model, conditions) {
    adaptConditions(conditions);
    return await model.findOneAndDelete(conditions);
}

async function updateOne(model, conditions, updates) {
    adaptConditions(conditions);
    let doc = await model.findOne(conditions);
    Object.entries(updates).forEach(update => {
        if (update[0] in doc) {
            doc[update[0]] = update[1];
        }
    });
    return await doc.save();
}

async function increment(model, conditions, incrementor) {
    adaptConditions(conditions);
    const doc = await model.findOne(conditions);
    if(doc){
        doc.$inc(...incrementor);
        return await doc.save();
    } else{
        return null;
    }
}

function adaptEntity(Entity, dbDoc, idName = "id") {
    dbDoc = dbDoc.toJSON();
    dbDoc[idName] = dbDoc._id.toString();
    return new Entity(dbDoc);
}

module.exports = {
    exists,
    count,
    create,
    findOne,
    findMany,
    deleteOne,
    updateOne,
    adaptEntity,
    increment
};