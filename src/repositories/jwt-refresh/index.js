const { jwtRefreshDb } = require("../../data-access/dbs");
const { makeAddJwtRefreshRepo, makeCheckJwtRefreshRepo, makeDeleteJwtRefreshRepo } = require("./jwt-refresh-repo");

module.exports = {
    addJwtRefreshRepo: makeAddJwtRefreshRepo(jwtRefreshDb),
    checkJwtRefreshRepo: makeCheckJwtRefreshRepo(jwtRefreshDb),
    deleteJwtRefreshRepo: makeDeleteJwtRefreshRepo(jwtRefreshDb)
};