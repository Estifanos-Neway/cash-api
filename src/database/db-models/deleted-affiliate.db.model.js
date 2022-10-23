const mongoose = require("mongoose");
const utils = require("../../commons/functions");
const { imageJsonSchema } = require("./db-model.commons");

const required = true;
const deletedAffiliateSchema = new mongoose.Schema(
    {
        affiliate: {
            fullName: {
                type: String,
                required
            },
            phone: {
                type: String,
                required,
                validate: {
                    validator: (value) => {
                        utils.isPhone(value);
                    },
                    message: "Invalid_Phone"
                }
            },
            email: {
                type: String,
                required,
                validate: {
                    validator: (value) => utils.isEmail(value),
                    message: "Invalid_Email"
                }
            },
            sanitizedEmail: {
                type: String,
                validate: {
                    validator: (value) => utils.isEmail(value),
                    message: "Invalid_Email"
                }
            },
            passwordHash: {
                type: String,
                required
            },
            avatar: imageJsonSchema,
            parentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Affiliate",
                immutable: true
            },
            memberSince: {
                type: String,
                cast: (value) => value
            },
            _id: mongoose.Schema.Types.ObjectId
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
module.exports = mongoose.model("DeletedAffiliate", deletedAffiliateSchema, "deleted_affiliates");