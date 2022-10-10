const _ = require("lodash");
const mongoose = require("mongoose");
const {
    invalidPriceResponseText,
    invalidViewCountResponseText } = require("../../commons/response-texts");
const {
    imageJsonSchema,
    commissionRate } = require("./db-model.commons");

const required = true;

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required,
            unique: true
        },
        mainImage: imageJsonSchema,
        moreImages: [imageJsonSchema],
        price: {
            type: Number,
            validate: {
                validator: (value) => value >= 0,
                message: invalidPriceResponseText
            },
            required
        },
        commissionRate,
        categories: [String],
        published: {
            type: Boolean,
            default: false
        },
        featured: {
            type: Boolean,
            default: false
        },
        viewCount: {
            type: Number,
            validate: {
                validator: (value) => value >= 0 && _.isInteger(value),
                message: invalidViewCountResponseText
            },
            default: 0
        },

    },
    { strictQuery: false }
);

module.exports = mongoose.model("product", productSchema, "products");