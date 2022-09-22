async function exists(dbConnector, model, condition) {
    await dbConnector();
    return await model.exists(condition);
}

async function count(dbConnector, model) {
    await dbConnector();
    return await model.count();
}

async function create(dbConnector, model, doc) {
    await dbConnector();
    await model.create(doc);
}

async function findOne(dbConnector, model, condition) {
    await dbConnector();
    return await model.findOne(condition);
}

async function deleteOne(dbConnector, model, condition) {
    await dbConnector();
    return await model.deleteOne(condition);
}

async function updateOne(dbConnector, model, condition, updates) {
    await dbConnector();
    let doc = await model.findOne(condition);
    Object.entries(updates).forEach(update => {
        if (update[0] in doc){
            doc[update[0]] = update[1];
        }
    });
    await doc.save();
}

module.exports = {
    exists,
    count,
    create,
    findOne,
    deleteOne,
    updateOne
};