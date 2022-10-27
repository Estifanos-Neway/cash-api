const express = require("express");
const { ordersCont } = require("../controllers");

const ordersRouter = express.Router();
ordersRouter.post("/", ordersCont.create);

module.exports = ordersRouter;