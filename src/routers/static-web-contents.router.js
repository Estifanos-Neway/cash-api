const express = require("express");
const { staticWebContentsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const staticWebContentsRouter = express.Router();
staticWebContentsRouter.get("/", staticWebContentsCont.get);
staticWebContentsRouter.put("/", forceAdminMid, staticWebContentsCont.update);
module.exports = staticWebContentsRouter;