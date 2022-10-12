const { jwtRefreshesDb } = require("../database");

module.exports = Object.freeze({
    add: async (token) => await jwtRefreshesDb.create(token),
    exists: async (token) => await jwtRefreshesDb.exists(token),
    delete: async (token) => await jwtRefreshesDb.deleteOne(token)
});