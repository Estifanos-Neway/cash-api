const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const {
    signInAdminCont,
    changeAdminPasswordHashCont,
    getAdminCont,
    updateAdminSettingsCont,
    getAdminSettingsCont,
    sendAdminEmailVerificationCont,
    verifyAdminEmailCont,
    sendAdminPasswordRecoveryEmailCont,
    recoverAdminPasswordCont,
    changeAdminUsernameCont } = require("../controllers/admin-controllers");

const adminRouter = express.Router();
adminRouter.post("/sign-in", signInAdminCont);
adminRouter.put("/forgot-password", sendAdminPasswordRecoveryEmailCont);
adminRouter.put("/recover-password", recoverAdminPasswordCont);
adminRouter.use(forceAccessToken(["admin"]));
adminRouter.get("/", getAdminCont);
adminRouter.patch("/username", changeAdminUsernameCont);
adminRouter.patch("/password-hash", changeAdminPasswordHashCont);
adminRouter.get("/settings", getAdminSettingsCont);
adminRouter.patch("/settings", updateAdminSettingsCont);
adminRouter.put("/email", sendAdminEmailVerificationCont);
adminRouter.put("/verify-email", verifyAdminEmailCont);
module.exports = adminRouter;