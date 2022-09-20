const express = require("express");
const { signinAdminController } = require("../controllers/admin");

exports.makeAdminRouter = function () {
    const adminRouter = express.Router();
    adminRouter.post("/signin", signinAdminController);
    return adminRouter;
};