const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const {
    createProductCont,
    getProductsCont,
    getProductCont } = require("../controllers/product-controllers");

const productsRouter = express.Router();
productsRouter.get("/", getProductsCont);
productsRouter.get("/:productId", getProductCont);
productsRouter.use(forceAccessToken(["admin"]));
productsRouter.post("/", createProductCont);

module.exports = productsRouter;