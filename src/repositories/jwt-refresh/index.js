const { jwtRefreshDb } = require("../../data-access");
const { makeAddJwtRefreshRepo, makeCheckJwtRefreshRepo, makeDeleteJwtRefreshRepo } = require("./jwt-refresh-repo");

module.exports = {
    addJwtRefreshRepo: makeAddJwtRefreshRepo(jwtRefreshDb),
    checkJwtRefreshRepo: makeCheckJwtRefreshRepo(jwtRefreshDb),
    deleteJwtRefreshRepo: makeDeleteJwtRefreshRepo(jwtRefreshDb)
};