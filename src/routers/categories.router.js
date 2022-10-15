const express = require("express");
const { categoriesCont } = require("../controllers");
const { forceAccessToken } = require("../controllers/middlewares");

const categoriesRouter = express.Router();
categoriesRouter.get("/", categoriesCont.getMany);
categoriesRouter.use(forceAccessToken(["admin"]));
categoriesRouter.post("/", categoriesCont.create);
categoriesRouter.patch("/:categoryId", categoriesCont.update);
categoriesRouter.delete("/:categoryId", categoriesCont.delete);
module.exports = categoriesRouter;