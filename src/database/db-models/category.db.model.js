const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        strictQuery: false,
        timestamps: true
    });

module.exports = mongoose.model("category", categorySchema, "categories");