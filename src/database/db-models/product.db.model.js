const _ = require("lodash");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const rt = require("../../commons/response-texts");
const utils = require("../../commons/functions");
const { imageJsonSchema } = require("./db-model.commons");

const required = true;

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required,
            unique: true,
            uniqueCaseInsensitive: true
        },
        description: String,
        mainImage: imageJsonSchema,
        moreImages: [imageJsonSchema],
        price: {
            type: Number,
            validate: {
                validator: utils.isPositiveNumber,
                message: rt.invalidPrice
            },
            required
        },
        commission: {
            type: Number,
            validate: {
                validator: utils.isPositiveNumber,
                message: rt.invalidCommission
            },
            required
        },
        categories: [String],
        published: {
            type: Boolean,
            default: false
        },
        featured: {
            type: Boolean,
            default: false
        },
        topSeller: {
            type: Boolean,
            default: false
        },
        viewCount: {
            type: Number,
            validate: {
                validator: (value) => value >= 0 && _.isInteger(value),
                message: rt.invalidViewCount
            },
            default: 0
        }

    },
    {
        strictQuery: false,
        timestamps: true
    }
);
productSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Product", productSchema, "products");