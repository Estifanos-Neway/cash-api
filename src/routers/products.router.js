const express = require("express");
const mids = require("../controllers/middlewares");
const { productsCont } = require("../controllers");
const { User } = require("../entities");

const findManyDefaultLimit = 8;
const findManyMaxLimit = 20;

const validateGetManyQueryMid = mids.validateGetManyQuery({ findManyDefaultLimit, findManyMaxLimit });

const productsRouter = express.Router();
productsRouter.get("/", validateGetManyQueryMid, productsCont.getMany);
productsRouter.get("/:productId", productsCont.getOne);
productsRouter.use(mids.forceAccessToken(User.userTypes.Admin));
productsRouter.post("/", productsCont.create);
productsRouter.patch("/:productId", productsCont.update);
productsRouter.delete("/:productId", productsCont.delete);

module.exports = productsRouter;