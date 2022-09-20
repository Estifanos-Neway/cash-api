const { Schema, model } = require("mongoose");

const jwtRefreshSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = model("jwtRefresh", jwtRefreshSchema);