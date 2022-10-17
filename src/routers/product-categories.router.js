const express = require("express");
const { productCategoriesCont } = require("../controllers");
const { forceAccessToken } = require("../controllers/middlewares");

const productCategoriesRouter = express.Router();
productCategoriesRouter.get("/", productCategoriesCont.getMany);
productCategoriesRouter.use(forceAccessToken(["admin"]));
productCategoriesRouter.post("/", productCategoriesCont.create);
productCategoriesRouter.patch("/:categoryId", productCategoriesCont.update);
productCategoriesRouter.delete("/:categoryId", productCategoriesCont.delete);
module.exports = productCategoriesRouter;