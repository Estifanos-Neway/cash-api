const { refreshTokenCont } = require("../controllers/tokens");
const { signOutCont } = require("../controllers/tokens");
const { changeAdminUsernameCont } = require("../controllers/admin");
const { makeAdminRouter } = require("./admin-router");
const { makeTokensRouter } = require("./tokens-router");
const {
    signInAdminCont,
    changeAdminPasswordHashCont,
    getAdminCont,
    updateAdminSettingsCont,
    getAdminSettingsCont } = require("../controllers/admin");

module.exports = {
    adminRouter: makeAdminRouter({
        signInAdminCont,
        changeAdminUsernameCont,
        changeAdminPasswordHashCont,
        getAdminCont,
        updateAdminSettingsCont,
        getAdminSettingsCont
    }),
    tokensRouter: makeTokensRouter(refreshTokenCont, signOutCont)
};