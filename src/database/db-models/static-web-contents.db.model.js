const mongoose = require("mongoose");

const staticWebContentsSchema = new mongoose.Schema(
    {
        videoLinks: {
            whoAreWe: String,
            howToAffiliateWithUs: String
        }
    }
);

module.exports = mongoose.model("Static_Web_Contents", staticWebContentsSchema, "static_web_contents");