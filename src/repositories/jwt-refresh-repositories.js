const { jwtRefreshesDb } = require("../database");

exports.addJwtRefreshRepo = async (token) => await jwtRefreshesDb.create(token);
exports.checkJwtRefreshRepo = async (token) => await jwtRefreshesDb.exists(token);
exports.deleteJwtRefreshRepo = async (token) => await jwtRefreshesDb.deleteOne(token);