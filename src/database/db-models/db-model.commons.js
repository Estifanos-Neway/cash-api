const mongoose = require("mongoose");
const { invalidCommissionRateResponseText } = require("../../commons/response-texts");

const required = true;

const imageJsonSchema = new mongoose.Schema({
    path: {
        type: String,
        required
    }
});

const commissionRate = {
    type: Number,
    validate: {
        validator: (value) => value >= 0 && value <= 100,
        message: invalidCommissionRateResponseText
    },
    required
};

module.exports = {
    imageJsonSchema,
    commissionRate
};