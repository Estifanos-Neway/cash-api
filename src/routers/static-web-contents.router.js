const express = require("express");
const { staticWebContentsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const staticWebContentsRouter = express.Router();
staticWebContentsRouter.get("/", staticWebContentsCont.get);
staticWebContentsRouter.put("/logo-image", forceAdminMid, staticWebContentsCont.updateLogoImage);
staticWebContentsRouter.put("/hero", forceAdminMid, staticWebContentsCont.updateHero);
staticWebContentsRouter.put("/about-us-image", forceAdminMid, staticWebContentsCont.updateAboutUsImage);
staticWebContentsRouter.put("/why-us", forceAdminMid, staticWebContentsCont.updateWhyUs);
staticWebContentsRouter.put("/what-makes-us-unique", forceAdminMid, staticWebContentsCont.updateWhatMakesUsUnique);
staticWebContentsRouter.put("/who-are-we", forceAdminMid, staticWebContentsCont.updateWhoAreWe);
staticWebContentsRouter.put("/how-tos", forceAdminMid, staticWebContentsCont.updateHowTos);
module.exports = staticWebContentsRouter;