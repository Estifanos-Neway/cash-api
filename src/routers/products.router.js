const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { productsCont } = require("../controllers");

const productsRouter = express.Router();
productsRouter.get("/", productsCont.getProducts);
productsRouter.get("/:productId", productsCont.getProduct);
productsRouter.use(forceAccessToken(["admin"]));
productsRouter.post("/", productsCont.createProduct);
productsRouter.patch("/:productId", productsCont.updateProduct);

module.exports = productsRouter;