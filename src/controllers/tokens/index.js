const { checkJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { deleteJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { makeRefreshTokenCont } = require("./refresh-token-cont");
const { makeSignOutCont } = require("./sign-out-cont");

module.exports = {
    refreshTokenCont: makeRefreshTokenCont(checkJwtRefreshRepo),
    signOutCont: makeSignOutCont(deleteJwtRefreshRepo)
};