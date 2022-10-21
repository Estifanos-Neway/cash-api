const express = require("express");
const mids = require("../controllers/middlewares");
const { affiliatesCont } = require("../controllers");
const { User } = require("../entities");

const findManyDefaultLimit = 8;
const findManyMaxLimit = 20;

const forceSameAffiliateMid = mids.forceSameUser([User.userTypes.Affiliate]);
const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);
const forceAffiliateMid = mids.forceAccessToken([User.userTypes.Affiliate]);
const forceUserMid = mids.forceAccessToken([User.userTypes.Admin, User.userTypes.Affiliate]);
const validateGetManyQueryMid = mids.validateGetManyQuery({ findManyDefaultLimit, findManyMaxLimit });

const affiliatesRouter = express.Router();
affiliatesRouter.post("/sign-up", affiliatesCont.signUp);
affiliatesRouter.post("/verify-sign-up", affiliatesCont.verifySignUp);
affiliatesRouter.post("/sign-in", affiliatesCont.signIn);
affiliatesRouter.patch("/forgot-password", affiliatesCont.forgotPassword);
affiliatesRouter.patch("/recover-password", affiliatesCont.recoverPassword);
affiliatesRouter.put("/:userId/avatar", forceAffiliateMid, forceSameAffiliateMid, affiliatesCont.updateAvatar);
affiliatesRouter.delete("/:userId/avatar", forceAffiliateMid, forceSameAffiliateMid, affiliatesCont.deleteAvatar);
affiliatesRouter.get("/:userId", forceUserMid, forceSameAffiliateMid, affiliatesCont.getOne);
affiliatesRouter.get("/", forceAdminMid, validateGetManyQueryMid, affiliatesCont.getMany);

module.exports = affiliatesRouter;