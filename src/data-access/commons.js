async function exists(dbConnector, model, doc) {
    await dbConnector();
    return !!(await model.exists(doc));
}
module.exports = {
    exists
};