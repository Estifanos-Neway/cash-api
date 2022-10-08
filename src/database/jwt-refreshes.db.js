const { exists, deleteOne, create } = require("./db-commons/functions");
const { jwtRefreshDbModel } = require("./db-models");

module.exports = Object.freeze({
    create: (token) => create(jwtRefreshDbModel, { token }),
    exists: (token) => exists(jwtRefreshDbModel, { token }),
    deleteOne: (token) => deleteOne(jwtRefreshDbModel, { token })
});