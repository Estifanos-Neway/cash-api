const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const utils = require("../../commons/functions");
const { User } = require("../../entities");
const { imageJsonSchema } = require("./db-model.commons");

const required = true;
const unique = true;
const affiliateSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required
        },
        phone: {
            type: String,
            required,
            unique,
            validate: {
                validator: (value) => {
                    utils.isPhone(value);
                },
                message: "Invalid_Phone"
            }
        },
        email: {
            type: String,
            unique,
            required,
            validate: {
                validator: (value) => utils.isEmail(value),
                message: "Invalid_Email"
            }
        },
        sanitizedEmail: {
            type: String,
            unique: true,
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
        }
    },
    {
        strictQuery: false,
        timestamps: {
            createdAt: "memberSince",
            updatedAt: false
        }
    }
);
// @ts-ignore
affiliateSchema.pre("save", function (next) {
    this.sanitizedEmail = utils.sanitizeEmail(this.email);
    next();
});

affiliateSchema.plugin(uniqueValidator);
module.exports = mongoose.model(User.userTypes.Affiliate, affiliateSchema, "affiliates");