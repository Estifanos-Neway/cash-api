const express = require("express");
const { analyticsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const analyticsRouter = express.Router();
analyticsRouter.get("/counts", forceAdminMid, analyticsCont.getCounts);

module.exports = analyticsRouter;