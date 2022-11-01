const express = require("express");
const { transactionsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const ordersRouter = express.Router();
ordersRouter.get("/", forceAdminMid, transactionsCont.getMany);
ordersRouter.get("/:transactionId", forceAdminMid, transactionsCont.getOne);

module.exports = ordersRouter;