const _ = require("lodash");
const mongoose = require("mongoose");
const {
    invalidPriceResponseText,
    invalidViewCountResponseText } = require("../../commons/response-texts");
const {
    imageJson,
    commissionRate } = require("./db-model.commons");

const required = true;

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required,
            unique: true
        },
        mainImage: {
            ...imageJson
        },
        moreImages: [{
            ...imageJson
        }],
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
            required
        },
        featured: {
            type: Boolean,
            required
        },
        viewCount: {
            type: Number,
            validate: {
                validator: (value) => value >= 0 && _.isInteger(value),
                message: invalidViewCountResponseText
            },
            required
        },

    }
);

module.exports = mongoose.model("product", productSchema, "products");