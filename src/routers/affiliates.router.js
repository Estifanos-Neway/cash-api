const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { affiliatesCont } = require("../controllers");
const { User } = require("../entities");

const affiliatesRouter = express.Router();
affiliatesRouter.post("/sign-up", affiliatesCont.signUp);
affiliatesRouter.post("/verify-sign-up", affiliatesCont.verifySignUp);
affiliatesRouter.post("/sign-in", affiliatesCont.signIn);
affiliatesRouter.patch("/forgot-password", affiliatesCont.forgotPassword);
affiliatesRouter.patch("/recover-password", affiliatesCont.recoverPassword);
// affiliatesRouter.get("/:userId/avatar", affiliatesCont.getAvatar);
affiliatesRouter.use(forceAccessToken([User.userTypes.Affiliate]));
affiliatesRouter.put("/:userId/avatar", affiliatesCont.updateAvatar);
affiliatesRouter.delete("/:userId/avatar", affiliatesCont.deleteAvatar);

module.exports = affiliatesRouter;