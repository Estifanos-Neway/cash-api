exports.makeDbConnector = function (mongoose,dbUrl) {
    return async function dbConnector() {
        await mongoose.connect(dbUrl, { keepAlive: false });
        return mongoose;
    };
};