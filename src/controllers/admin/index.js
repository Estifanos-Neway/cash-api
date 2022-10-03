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
    makeGetAdminSettingsCont,
    makeSendAdminEmailVerificationCont, 
    makeVerifyAdminEmailCont} = require("./admin-controllers");
const {
    createVerificationCode,
    sendEmail, 
    encrypt} = require("../../commons/functions");
const { verificationTokenExpiresIn } = require("../../commons/variables");

async function sendEmailVerificationCode(email) {
    const verificationCode = createVerificationCode();
    const subject = "Recovery Email verification";
    const html = `Verification code: ${verificationCode}`;
    const validUntil = new Date().getTime() +  verificationTokenExpiresIn * 60 * 1000;
    await sendEmail({ subject, html, to: email });
    console.log(html);
    const verificationObject = { email, verificationCode, validUntil };
    return encrypt(verificationObject);
}

module.exports = {
    signInAdminCont: makeSignInAdminCont({ signInAdminRepo, addJwtRefreshRepo }),
    getAdminCont: makeGetAdminCont({ getAdminRepo }),
    getAdminSettingsCont: makeGetAdminSettingsCont({ getAdminSettingsRepo }),
    changeAdminUsernameCont: makeChangeAdminUsernameCont({ changeAdminUsernameRepo }),
    changeAdminPasswordHashCont: makeChangeAdminPasswordHashCont({ changeAdminPasswordHashRepo }),
    updateAdminSettingsCont: makeUpdateAdminSettingsCont({ updateAdminSettingsRepo }),
    sendAdminEmailVerificationCont: makeSendAdminEmailVerificationCont({ sendEmailVerificationCode }),
    verifyAdminEmailCont: makeVerifyAdminEmailCont()
};