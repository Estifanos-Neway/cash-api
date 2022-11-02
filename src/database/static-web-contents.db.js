const { db } = require("./db.commons");
const { staticWebContentsDbModel } = require("./db-models");
const { StaticWebContents } = require("../entities");

module.exports = Object.freeze({
    update: async (updates) => {
        let staticWebContentsDoc = await staticWebContentsDbModel.findOne({});
        if (!staticWebContentsDoc) {
            // create
            const staticWebContents = new StaticWebContents(updates);
            const staticWebContentsDoc = await db.create(staticWebContentsDbModel, staticWebContents.toJson());
            return new StaticWebContents(staticWebContentsDoc.toJSON());
        } else {
            // update
            staticWebContentsDoc.update(updates, { upsert: true });
            const updatedStaticWebContentsDoc = await staticWebContentsDoc.save();
            return new StaticWebContents(updatedStaticWebContentsDoc.toJSON());
        }
    },
    findOne: async () => {
        const staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        return staticWebContentsDoc ? new StaticWebContents(staticWebContentsDoc.toJSON()) : null;
    }
});