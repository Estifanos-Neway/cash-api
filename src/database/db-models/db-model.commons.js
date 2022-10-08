const { invalidCommissionRateResponseText } = require("../../commons/response-texts");

const required = true;

const imageJson = {
    url: {
        type: String,
        required
    }
};

const commissionRate = {
    type: Number,
    validate: {
        validator: (value) => value >= 0 && value <= 100,
        message: invalidCommissionRateResponseText
    },
    required
};

module.exports = {
    imageJson,
    commissionRate
};