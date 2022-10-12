const jwt = require("jsonwebtoken");
const { Schema, model } = require("mongoose");
const { env } = require("../../env");

const jwtRefreshSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        default: function () {
            try {
                // @ts-ignore
                const tokenObject = jwt.verify(this.token, env.JWT_REFRESH_SECRETE);
                return tokenObject.userId;
            } catch (error) {
                return undefined;
            }
        },
    },
    date: {
        type: Number,
        default: () => new Date().getTime()
    }
});

module.exports = model("jwtRefresh", jwtRefreshSchema, "jwt_refreshes");