const { db } = require("./db.commons");
const { staticWebContentsDbModel } = require("./db-models");
const { StaticWebContents } = require("../entities");

function adaptEntity(dbDoc) {
    dbDoc = dbDoc.toJSON();
    if (dbDoc.brands) {
        for (const brand of dbDoc.brands) {
            brand.id = brand._id;
            delete brand._id;
        }
        dbDoc.brands.sort((brand1, brand2) => {
            return brand1.rank < brand2.rank ? 1 : -1;
        });
    }
    return new StaticWebContents(dbDoc);
}
module.exports = Object.freeze({
    update: async (updates) => {
        const updateOptions = { upsert: true };
        const updatedStaticWebContentsDoc = await db.updateOne(staticWebContentsDbModel, {}, updates, updateOptions);
        return adaptEntity(updatedStaticWebContentsDoc);
    },
    findOne: async ({ select }) => {
        const staticWebContentsDoc = await db.findOne(staticWebContentsDbModel, undefined, select);
        return staticWebContentsDoc ? adaptEntity(staticWebContentsDoc) : null;
    },
    addBrand: async ({ brand }) => {
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        staticWebContentsDoc.brands.push(brand);
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    }
});