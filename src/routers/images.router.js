const express = require("express");
const { downloadProductImagesCont } = require("../controllers/image-controllers");

const imageRouter = express.Router();

imageRouter.get("/products/:fileName", downloadProductImagesCont);

module.exports = imageRouter;