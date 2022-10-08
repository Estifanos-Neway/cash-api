const express = require("express");
const {
    refreshTokenCont,
    signOutCont } = require("../controllers/token-controllers");

const tokensRouter = express.Router();
tokensRouter.get("/refresh", refreshTokenCont);
tokensRouter.delete("/sign-out", signOutCont);
module.exports = tokensRouter;