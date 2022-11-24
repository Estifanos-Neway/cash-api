const express = require("express");
const { imagesCont,filesCon } = require("../controllers");

const imageRouter = express.Router();

imageRouter.get("/avatars/:fileName", imagesCont.getAvatar);
imageRouter.get("/products/:fileName", imagesCont.downloadProductImage);
imageRouter.get("/:collectionName/:fileName", filesCon.download);

module.exports = imageRouter;