const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");

exports.makeAdminRouter = (signInAdminCont, changeAdminUsernameCont, changeAdminPasswordHashCont) => {
    const adminRouter = express.Router();
    adminRouter.post("/sign-in", signInAdminCont);
    adminRouter.use(forceAccessToken);
    adminRouter.patch("/username", changeAdminUsernameCont);
    adminRouter.patch("/password-hash", changeAdminPasswordHashCont);
    return adminRouter;
};