const { refreshTokenCont } = require("../controllers/tokens");
const { signOutCont } = require("../controllers/tokens");
const { changeAdminUsernameCont } = require("../controllers/admin");
const { makeAdminRouter } = require("./admin.router");
const { makeTokensRouter } = require("./tokens.router");
const {
    signInAdminCont,
    changeAdminPasswordHashCont,
    getAdminCont,
    updateAdminSettingsCont,
    getAdminSettingsCont,
    sendAdminEmailVerificationCont,
    verifyAdminEmailCont,
    sendAdminPasswordRecoveryEmailCont,
    recoverAdminPasswordCont } = require("../controllers/admin");
const { makeDocsRouter } = require("./docs.router");

module.exports = {
    adminRouter: makeAdminRouter({
        signInAdminCont,
        changeAdminUsernameCont,
        changeAdminPasswordHashCont,
        getAdminCont,
        updateAdminSettingsCont,
        getAdminSettingsCont,
        sendAdminEmailVerificationCont,
        verifyAdminEmailCont,
        sendAdminPasswordRecoveryEmailCont,
        recoverAdminPasswordCont
    }),
    tokensRouter: makeTokensRouter(refreshTokenCont, signOutCont),
    docsRouter: makeDocsRouter()
};