const express = require("express");
const { staticWebContentsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const staticWebContentsRouter = express.Router();
staticWebContentsRouter.get("/", staticWebContentsCont.get);
staticWebContentsRouter.put("/logo-image", forceAdminMid, staticWebContentsCont.updateLogoImage);
staticWebContentsRouter.put("/what-makes-us-unique", forceAdminMid, staticWebContentsCont.updateWhatMakesUsUnique);
module.exports = staticWebContentsRouter;