const { db } = require("./db.commons");
const { staticWebContentsDbModel } = require("./db-models");
const { StaticWebContents } = require("../entities");

module.exports = Object.freeze({
    update: async (updates) => {
        const updateOptions = { upsert: true };
        const updatedStaticWebContentsDoc = await db.updateOne(staticWebContentsDbModel, {}, updates, updateOptions);
        return new StaticWebContents(updatedStaticWebContentsDoc.toJSON());
    },
    findOne: async () => {
        const staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        return staticWebContentsDoc ? new StaticWebContents(staticWebContentsDoc.toJSON()) : null;
    }
});