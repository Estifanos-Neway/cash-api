const { StaticWebContents } = require("../entities");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { staticWebContentsDb } = require("../database");

module.exports = {
    update: async ({ videoLinks }) => {
        const staticWebContents = new StaticWebContents({ videoLinks });
        if (!staticWebContents.videoLinks) {
            throw utils.createError(rt.requiredParamsNotFound, rc.invalidInput);
        } else if (!staticWebContents.videoLinks?.hasValidWhoAreWe()) {
            throw utils.createError(rt.invalidWhoAreWeVideoLink, rc.invalidInput);
        } else if (!staticWebContents.videoLinks?.hasValidHowToAffiliateWithUs()) {
            throw utils.createError(rt.invalidHowToAffiliateWithUsVideoLink, rc.invalidInput);
        } else {
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return updatedStaticWebContents.toJson();
        }
    },
    get: async () => {
        const staticWebContents = await staticWebContentsDb.findOne();
        return staticWebContents ? staticWebContents.toJson() : {};
    }
};