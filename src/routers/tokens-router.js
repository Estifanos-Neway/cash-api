const express = require("express");

exports.makeTokensRouter = (refreshTokenCont, signOutCont) => {
    const tokensRouter = express.Router();
    tokensRouter.get("/refresh", refreshTokenCont);
    tokensRouter.delete("/sign-out", signOutCont);
    return tokensRouter;
};