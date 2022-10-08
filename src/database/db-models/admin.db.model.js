const mongoose = require("mongoose");
const { isEmail } = require("../../commons/functions");
const { invalidEmailResponseText } = require("../../commons/response-texts");
const { commissionRate } = require("./db-model.commons");

const required = true;

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required,
        unique: true
    },
    passwordHash: {
        type: String,
        required
    },
    email: {
        type: String,
        validate: {
            validator: (value) => isEmail(value),
            message: invalidEmailResponseText
        }
    },
    settings: {
        commissionRate
    }
});

module.exports = mongoose.model("admin", adminSchema, "admins");