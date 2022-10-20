const express = require("express");
const { imagesCont } = require("../controllers");

const imageRouter = express.Router();

imageRouter.get("/avatars/:fileName", imagesCont.getAvatar);
imageRouter.get("/products/:fileName", imagesCont.downloadProductImage);

module.exports = imageRouter;