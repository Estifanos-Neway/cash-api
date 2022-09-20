const express = require("express");
const { signInAdminController } = require("../controllers/admin");

exports.makeAdminRouter = function () {
    const adminRouter = express.Router();
    adminRouter.post("/signIn", signInAdminController);
    return adminRouter;
};