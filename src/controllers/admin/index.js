const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { changeAdminUsernameRepo } = require("../../repositories/admin");
const { sendEmailVerificationCode } = require("../../commons/functions");
const {
    signInAdminRepo,
    changeAdminPasswordHashRepo,
    getAdminRepo,
    updateAdminSettingsRepo,
    getAdminSettingsRepo } = require("../../repositories/admin");
const {
    makeGetAdminCont,
    makeChangeAdminPasswordHashCont,
    makeChangeAdminUsernameCont,
    makeSignInAdminCont,
    makeUpdateAdminSettingsCont,
    makeGetAdminSettingsCont,
    makeSendAdminEmailVerificationCont } = require("./admin-controllers");

module.exports = {
    signInAdminCont: makeSignInAdminCont({ signInAdminRepo, addJwtRefreshRepo }),
    getAdminCont: makeGetAdminCont({ getAdminRepo }),
    getAdminSettingsCont: makeGetAdminSettingsCont({ getAdminSettingsRepo }),
    changeAdminUsernameCont: makeChangeAdminUsernameCont({ changeAdminUsernameRepo }),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont({ changeAdminPasswordHashRepo }),
    updateAdminSettingsCont: makeUpdateAdminSettingsCont({ updateAdminSettingsRepo }),
    sendAdminEmailVerificationCont: makeSendAdminEmailVerificationCont({ sendEmailVerificationCode })
};