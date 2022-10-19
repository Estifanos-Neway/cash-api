const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { adminCont } = require("../controllers");
const { User } = require("../entities");

const adminRouter = express.Router();
adminRouter.post("/sign-in", adminCont.signIn);
adminRouter.put("/forgot-password", adminCont.sendPasswordRecoveryEmail);
adminRouter.put("/recover-password", adminCont.recoverPassword);
adminRouter.use(forceAccessToken([User.userTypes.Admin]));
adminRouter.get("/", adminCont.get);
adminRouter.patch("/username", adminCont.changeUsername);
adminRouter.patch("/password-hash", adminCont.changePasswordHash);
adminRouter.get("/settings", adminCont.getSettings);
adminRouter.patch("/settings", adminCont.updateSettings);
adminRouter.put("/email", adminCont.sendEmailVerification);
adminRouter.put("/verify-email", adminCont.verifyEmail);
module.exports = adminRouter;