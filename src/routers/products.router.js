const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { createProductCont } = require("../controllers/product-controllers");

const productsRouter = express.Router();
productsRouter.use(forceAccessToken(["admin"]));
productsRouter.post("/", createProductCont);

module.exports = productsRouter;