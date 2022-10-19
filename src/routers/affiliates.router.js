const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { affiliatesCont } = require("../controllers");
const { User } = require("../entities");

const affiliatesRouter = express.Router();
affiliatesRouter.post("/sign-up", affiliatesCont.signUp);
affiliatesRouter.post("/verify-sign-up", affiliatesCont.verifySignUp);
affiliatesRouter.use(forceAccessToken([User.userTypes.Affiliate]));

module.exports = affiliatesRouter;