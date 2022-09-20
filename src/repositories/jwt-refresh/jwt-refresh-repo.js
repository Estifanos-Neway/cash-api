exports.makeAddJwtRefreshRepo = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.create(token);
};

exports.makeCheckJwtRefreshRepo = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.exists(token);
};

exports.makeDeleteJwtRefreshRepo = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.deleteOne(token);
};