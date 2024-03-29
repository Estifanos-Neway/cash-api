const mongoose = require("mongoose");
const { imageJsonSchema } = require("./db-model.commons");

const logoWithLinkSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        logoImage: {
            type: imageJsonSchema,
            required: true
        },
        link: String,
        rank: {
            type: Number,
            default: 0
        }
    },
    { strictQuery: false }
);
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
        whatMakesUsUniqueImage: imageJsonSchema,
        whoAreWeImage: imageJsonSchema,
        whoAreWeDescription: String,
        whoAreWeVideoLink: String,
        howToBuyFromUsDescription: String,
        howToAffiliateWithUsDescription: String,
        howToAffiliateWithUsVideoLink: String,
        brands: [logoWithLinkSchema],
        socialLinks: [logoWithLinkSchema]
    }
);

module.exports = mongoose.model("Static_Web_Contents", staticWebContentsSchema, "static_web_contents");