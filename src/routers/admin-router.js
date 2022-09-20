exports.makeAdminRouter = (express, signInAdminController) => {
    const adminRouter = express.Router();
    adminRouter.post("/signIn", signInAdminController);
    return adminRouter;
};