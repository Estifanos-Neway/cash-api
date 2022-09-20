const { jwtRefreshDb } = require("../../data-access/dbs");
const { makeAddJwtRefresh, makeCheckJwtRefresh, makeDeleteJwtRefresh } = require("./jwt-refresh-repo");

module.exports = {
    addJwtRefresh: makeAddJwtRefresh(jwtRefreshDb),
    checkJwtRefresh: makeCheckJwtRefresh(jwtRefreshDb),
    deleteJwtRefresh: makeDeleteJwtRefresh(jwtRefreshDb)
};