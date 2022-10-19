const express = require("express");
const { productCategoriesCont } = require("../controllers");
const { forceAccessToken } = require("../controllers/middlewares");
const { User } = require("../entities");

const productCategoriesRouter = express.Router();
productCategoriesRouter.get("/", productCategoriesCont.getMany);
productCategoriesRouter.use(forceAccessToken([User.userTypes.Admin]));
productCategoriesRouter.post("/", productCategoriesCont.create);
productCategoriesRouter.patch("/:categoryId", productCategoriesCont.update);
productCategoriesRouter.delete("/:categoryId", productCategoriesCont.delete);
module.exports = productCategoriesRouter;