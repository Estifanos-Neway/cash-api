const express = require("express");
const { ordersCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const ordersRouter = express.Router();
ordersRouter.post("/", ordersCont.create);
ordersRouter.get("/", forceAdminMid, ordersCont.getMany);
ordersRouter.get("/:orderId", forceAdminMid, ordersCont.getOne);

module.exports = ordersRouter;