const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { productsCont } = require("../controllers");

const productsRouter = express.Router();
productsRouter.get("/", productsCont.getMany);
productsRouter.get("/:productId", productsCont.getOne);
productsRouter.use(forceAccessToken(["admin"]));
productsRouter.post("/", productsCont.create);
productsRouter.patch("/:productId", productsCont.update);
productsRouter.delete("/:productId", productsCont.delete);

module.exports = productsRouter;