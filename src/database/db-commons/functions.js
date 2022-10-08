async function exists(model, condition) {
    return await model.exists(condition);
}

async function count(model) {
    return await model.count();
}

async function create(model, doc) {
    return await model.create(doc);
}

async function findOne(model, condition, selection) {
    return await model.findOne(condition).select(selection).exec();
}

async function findMany({ model, condition, selection, sort }) {
    return await model.find(condition).select(selection).sort(sort).exec();
}

async function deleteOne(model, condition) {
    return await model.deleteOne(condition);
}

async function updateOne(model, condition, updates) {
    let doc = await model.findOne(condition);
    Object.entries(updates).forEach(update => {
        if (update[0] in doc) {
            doc[update[0]] = update[1];
        }
    });
    return await doc.save();
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
    adaptEntity
};