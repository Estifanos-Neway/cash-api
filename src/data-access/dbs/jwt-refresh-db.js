exports.makeJwtRefreshDb = function (dbConnector, jwtRefreshModel,exists, deleteOne, create) {
    return Object.freeze({
        create: (token) => create(dbConnector, jwtRefreshModel, { token }),
        exists: (token) => exists(dbConnector, jwtRefreshModel, { token }),
        deleteOne: (token) => deleteOne(dbConnector, jwtRefreshModel, { token })
    });
};