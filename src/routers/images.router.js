const express = require("express");
const { imagesCont } = require("../controllers");

const imageRouter = express.Router();

imageRouter.get("/products/:fileName", imagesCont.downloadProductImagesCont);

module.exports = imageRouter;