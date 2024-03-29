const mongoose = require("mongoose");
const { User } = require("../../entities");

const required = true;
const sessionsSchema = new mongoose.Schema(
    {
        user: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "userType",
                required
            },
            userType: {
                type: String,
                required,
                enum: Object.keys(User.userTypes)
            }
        },
        refreshToken: {
            type: String,
            required
        }
    },
    {
        strictQuery: false,
        timestamps: {
            createdAt: "startedAt",
            updatedAt: false
        }
    }
);

module.exports = mongoose.model("Session", sessionsSchema, "sessions");