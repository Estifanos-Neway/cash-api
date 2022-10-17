const { db } = require("./db.commons");
const { jwtRefreshDbModel } = require("./db-models");

module.exports = Object.freeze({
    create: (token) => db.create(jwtRefreshDbModel, { token }),
    exists: (token) => db.exists(jwtRefreshDbModel, { token }),
    deleteOne: (token) => db.deleteOne(jwtRefreshDbModel, { token })
});