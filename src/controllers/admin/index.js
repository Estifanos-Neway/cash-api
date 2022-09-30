const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { changeAdminUsernameRepo } = require("../../repositories/admin");
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
    makeGetAdminSettingsCont } = require("./admin-controllers");

module.exports = {
    signInAdminCont: makeSignInAdminCont({ signInAdminRepo, addJwtRefreshRepo }),
    getAdminCont: makeGetAdminCont({ getAdminRepo }),
    getAdminSettingsCont: makeGetAdminSettingsCont({ getAdminSettingsRepo }),
    changeAdminUsernameCont: makeChangeAdminUsernameCont({ changeAdminUsernameRepo }),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont({ changeAdminPasswordHashRepo }),
    updateAdminSettingsCont: makeUpdateAdminSettingsCont({ updateAdminSettingsRepo }),
};