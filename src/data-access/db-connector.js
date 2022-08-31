const mongoose = require("mongoose");

module.exports = function (dbUrl) {
    return async function () {
        await mongoose.connect(dbUrl);
        return mongoose;
    };
};