const mongoose = require("mongoose");

exports.makeDbConnector = function (dbUrl) {
    return async function dbConnector() {
        await mongoose.connect(dbUrl, { keepAlive: true });
        return mongoose;
    };
};