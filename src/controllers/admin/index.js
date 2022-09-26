const { signInAdminRepo, changeAdminPasswordHashRepo, getAdminRepo, updateAdminSettingsRepo } = require("../../repositories/admin");
const { addJwtRefreshRepo } = require("../../repositories/jwt-refresh");
const { changeAdminUsernameRepo } = require("../../repositories/admin");
const {
    makeGetAdminCont,
    makeChangeAdminPasswordHashCont,
    makeChangeAdminUsernameCont,
    makeSignInAdminCont,
    makeUpdateAdminSettingsCont } = require("./admin-controllers");

module.exports = {
    signInAdminCont: makeSignInAdminCont({ signInAdminRepo, addJwtRefreshRepo }),
    changeAdminUsernameCont: makeChangeAdminUsernameCont({ changeAdminUsernameRepo }),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont({ changeAdminPasswordHashRepo }),
    getAdminCont: makeGetAdminCont({ getAdminRepo }),
    updateAdminSettingsCont: makeUpdateAdminSettingsCont({ updateAdminSettingsRepo }),
};