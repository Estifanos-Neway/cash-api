const express = require("express");
const { sessionsCont } = require("../controllers");

const sessionsRouter = express.Router();
sessionsRouter.get("/refresh", sessionsCont.refresh);
sessionsRouter.delete("/sign-out", sessionsCont.signOut);

module.exports = sessionsRouter;