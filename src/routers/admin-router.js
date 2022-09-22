exports.makeAdminRouter = (express, signInAdminController, forceAccessToken,changeAdminUsernameCont) => {
    const adminRouter = express.Router();
    adminRouter.post("/signIn", signInAdminController);
    adminRouter.use(forceAccessToken);
    adminRouter.patch("/username",changeAdminUsernameCont);
    return adminRouter;
};