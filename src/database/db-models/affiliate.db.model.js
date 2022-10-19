const mongoose = require("mongoose");
const utils = require("../../commons/functions");
const { imageJsonSchema } = require("./db-model.commons");

const required = true;
const affiliateSchema = new mongoose.Schema(
    {
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
            unique: true,
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
        parentId: String
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

module.exports = mongoose.model("affiliate", affiliateSchema, "affiliates");