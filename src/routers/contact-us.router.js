const express = require("express");
const { contactUsCon } = require("../controllers");


const contactUsRouter = express.Router();
contactUsRouter.post("/", contactUsCon.send);

module.exports = contactUsRouter;