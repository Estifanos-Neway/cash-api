const express = require("express");
const { forceAccessToken, forceSameUser } = require("../controllers/middlewares");
const { affiliatesCont } = require("../controllers");
const { User } = require("../entities");

const affiliatesRouter = express.Router();
affiliatesRouter.post("/sign-up", affiliatesCont.signUp);
affiliatesRouter.post("/verify-sign-up", affiliatesCont.verifySignUp);
affiliatesRouter.post("/sign-in", affiliatesCont.signIn);
affiliatesRouter.patch("/forgot-password", affiliatesCont.forgotPassword);
affiliatesRouter.patch("/recover-password", affiliatesCont.recoverPassword);
affiliatesRouter.use(forceAccessToken([User.userTypes.Affiliate]));
// affiliatesRouter.use(forceSameUser([User.userTypes.Affiliate]));
affiliatesRouter.put("/:userId/avatar", forceSameUser([User.userTypes.Affiliate]), affiliatesCont.updateAvatar);
affiliatesRouter.delete("/:userId/avatar", forceSameUser([User.userTypes.Affiliate]), affiliatesCont.deleteAvatar);
affiliatesRouter.use(forceAccessToken([User.userTypes.Admin, User.userTypes.Affiliate]));
affiliatesRouter.get("/:userId", forceSameUser([User.userTypes.Affiliate]), affiliatesCont.getOne);
affiliatesRouter.use(forceAccessToken([User.userTypes.Admin]));
affiliatesRouter.get("/", affiliatesCont.getMany);


module.exports = affiliatesRouter;