const express = require("express");
const { tokensCont } = require("../controllers");

const tokensRouter = express.Router();
tokensRouter.get("/refresh", tokensCont.refresh);
tokensRouter.delete("/sign-out", tokensCont.signOut);
module.exports = tokensRouter;