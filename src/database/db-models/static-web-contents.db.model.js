const mongoose = require("mongoose");
const { imageJsonSchema } = require("./db-model.commons");

const staticWebContentsSchema = new mongoose.Schema(
    {
        logoImage: imageJsonSchema,
        heroImage: imageJsonSchema,
        heroShortTitle: String,
        heroLongTitle: String,
        heroDescription: String,
        aboutUsImage: imageJsonSchema,
        whyUsImage: imageJsonSchema,
        whyUsTitle: String,
        whyUsDescription: String,
        whatMakesUsUnique: [String],
        whoAreWeImage: imageJsonSchema,
        whoAreWeDescription: String,
        whoAreWeVideoLink: String,
        howToBuyFromUsDescription: String,
        howToAffiliateWithUsDescription: String,
        howToAffiliateWithUsVideoLink: String,

    }
);

module.exports = mongoose.model("Static_Web_Contents", staticWebContentsSchema, "static_web_contents");