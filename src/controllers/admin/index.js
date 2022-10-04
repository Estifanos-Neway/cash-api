const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { changeAdminUsernameRepo } = require("../../repositories/admin");
const {
    signInAdminRepo,
    changeAdminPasswordHashRepo,
    getAdminRepo,
    updateAdminSettingsRepo,
    getAdminSettingsRepo,
    recoverAdminPasswordHashRepo } = require("../../repositories/admin");
const {
    makeGetAdminCont,
    makeChangeAdminPasswordHashCont,
    makeChangeAdminUsernameCont,
    makeSignInAdminCont,
    makeUpdateAdminSettingsCont,
    makeGetAdminSettingsCont,
    makeSendAdminEmailVerificationCont,
    makeVerifyAdminEmailCont,
    makeSendAdminPasswordRecoveryEmailCont,
    makeRecoverAdminPasswordCont } = require("./admin-controllers");
const {
    sendEmailVerification,
    sendEmailVerificationCode } = require("../controller-commons/functions");

module.exports = {
    signInAdminCont: makeSignInAdminCont({ signInAdminRepo, addJwtRefreshRepo }),
    getAdminCont: makeGetAdminCont({ getAdminRepo }),
    getAdminSettingsCont: makeGetAdminSettingsCont({ getAdminSettingsRepo }),
    changeAdminUsernameCont: makeChangeAdminUsernameCont({ changeAdminUsernameRepo }),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont({ changeAdminPasswordHashRepo }),
    updateAdminSettingsCont: makeUpdateAdminSettingsCont({ updateAdminSettingsRepo }),
    sendAdminEmailVerificationCont: makeSendAdminEmailVerificationCont({ sendEmailVerificationCode }),
    verifyAdminEmailCont: makeVerifyAdminEmailCont(),
    sendAdminPasswordRecoveryEmailCont: makeSendAdminPasswordRecoveryEmailCont({ getAdminRepo, sendEmailVerification }),
    recoverAdminPasswordCont: makeRecoverAdminPasswordCont({ getAdminRepo, recoverAdminPasswordHashRepo })
};