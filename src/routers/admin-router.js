const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");

exports.makeAdminRouter = (
    {
        signInAdminCont,
        getAdminCont,
        getAdminSettingsCont,
        changeAdminUsernameCont,
        changeAdminPasswordHashCont,
        updateAdminSettingsCont
    }) => {
    const adminRouter = express.Router();
    adminRouter.post("/sign-in", signInAdminCont);
    adminRouter.use(forceAccessToken);
    adminRouter.get("/", getAdminCont);
    adminRouter.patch("/username", changeAdminUsernameCont);
    adminRouter.patch("/password-hash", changeAdminPasswordHashCont);
    adminRouter.get("/settings", getAdminSettingsCont);
    adminRouter.patch("/settings", updateAdminSettingsCont);
    return adminRouter;
};