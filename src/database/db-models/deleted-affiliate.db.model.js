const mongoose = require("mongoose");
const affiliateDbModel = require("./affiliate.db.model");

const deletedAffiliateSchema = new mongoose.Schema(
    {
        affiliate: {
            type: affiliateDbModel.schema,
            required: true
        }
    },
    {
        strictQuery: false,
        timestamps: {
            createdAt: "deletedAt",
            updatedAt: false
        }
    }
);
module.exports = mongoose.model("DeletedAt", deletedAffiliateSchema, "deleted_affiliates");