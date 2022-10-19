const mongoose = require("mongoose");
const { isEmail } = require("../../commons/functions");
const rt = require("../../commons/response-texts");
const { User } = require("../../entities");
const { commissionRateSchema } = require("./db-model.commons");

const required = true;

const adminSchema = new mongoose.Schema(
    {
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
                message: rt.invalidEmail 
            }
        },
        settings: {
            commissionRate:commissionRateSchema
        }
    },
    {
        strictQuery: false,
        timestamps: true
    });

module.exports = mongoose.model(User.userTypes.Admin, adminSchema, "admins");