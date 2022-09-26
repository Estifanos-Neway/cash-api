const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");

exports.makeAdminRouter = (
    {
        signInAdminCont,
        changeAdminUsernameCont,
        changeAdminPasswordHashCont,
        getAdminCont,
        updateAdminSettingsCont
    }) => {
    const adminRouter = express.Router();
    adminRouter.post("/sign-in", signInAdminCont);
    adminRouter.use(forceAccessToken);
    adminRouter.get("/", getAdminCont);
    adminRouter.patch("/username", changeAdminUsernameCont);
    adminRouter.patch("/password-hash", changeAdminPasswordHashCont);
    adminRouter.patch("/settings", updateAdminSettingsCont);
    return adminRouter;
};