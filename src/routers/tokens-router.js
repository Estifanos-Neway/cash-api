exports.makeTokensRouter = (express, refreshTokenCont, signOutCont) => {
    const tokensRouter = express.Router();
    tokensRouter.post("/refresh", refreshTokenCont);
    tokensRouter.delete("/signout", signOutCont);
    return tokensRouter;
};