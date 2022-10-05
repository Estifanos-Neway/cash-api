const mongoose = require("mongoose");
const { isEmail } = require("../../commons/functions");
const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            validator: (value) => {
                return isEmail(value);
            },
            message: "Invalid_Email"
        }
    },
    settings: {
        commissionRate: {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model("admins", AdminSchema);