exports.makeTokensRouter = (express, refreshTokenCont) => {
    const tokensRouter = express.Router();
    tokensRouter.post("/refresh", refreshTokenCont);
    return tokensRouter;
};