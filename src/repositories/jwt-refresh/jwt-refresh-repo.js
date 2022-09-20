
exports.makeAddJwtRefresh = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.create(token);
};

exports.makeCheckJwtRefresh = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.exists(token);
};

exports.makeDeleteJwtRefresh = function (jwtRefreshDb) {
    return async (token) => await jwtRefreshDb.deleteOne(token);
};