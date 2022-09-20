const { exists, deleteOne, create } = require("../db-commons/functions");

exports.makeJwtRefreshDb = function (dbConnector, jwtRefreshModel) {
    return Object.freeze({
        create: (token) => create(dbConnector, jwtRefreshModel, { token }),
        exists: (token) => exists(dbConnector, jwtRefreshModel, { token }),
        deleteOne: (token) => deleteOne(dbConnector, jwtRefreshModel, { token })
    });
};