const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productCategorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
            uniqueCaseInsensitive: true
        }
    },
    {
        strictQuery: false,
        timestamps: true
    });

productCategorySchema.plugin(uniqueValidator);
module.exports = mongoose.model("Product_Category", productCategorySchema, "product_categories");