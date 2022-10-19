const express = require("express");
const { forceAccessToken } = require("../controllers/middlewares");
const { productsCont } = require("../controllers");
const { User } = require("../entities");

const productsRouter = express.Router();
productsRouter.get("/", productsCont.getMany);
productsRouter.get("/:productId", productsCont.getOne);
productsRouter.use(forceAccessToken(User.userTypes.Admin));
productsRouter.post("/", productsCont.create);
productsRouter.patch("/:productId", productsCont.update);
productsRouter.delete("/:productId", productsCont.delete);

module.exports = productsRouter;