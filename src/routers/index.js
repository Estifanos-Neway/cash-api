const { signInAdminCont, changeAdminPasswordHashCont } = require("../controllers/admin");
const { refreshTokenCont } = require("../controllers/tokens");
const { signOutCont } = require("../controllers/tokens");
const { changeAdminUsernameCont } = require("../controllers/admin");
const { makeAdminRouter } = require("./admin-router");
const { makeTokensRouter } = require("./tokens-router");

module.exports = {
    adminRouter: makeAdminRouter(signInAdminCont,changeAdminUsernameCont,changeAdminPasswordHashCont),
    tokensRouter: makeTokensRouter(refreshTokenCont, signOutCont)
};