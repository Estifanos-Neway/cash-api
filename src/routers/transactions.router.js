const express = require("express");
const { transactionsCont } = require("../controllers");
const mids = require("../controllers/middlewares");
const { User } = require("../entities");

const forceAdminMid = mids.forceAccessToken([User.userTypes.Admin]);

const transactionsRouter = express.Router();
transactionsRouter.get("/", forceAdminMid, transactionsCont.getMany);
transactionsRouter.get("/:transactionId", forceAdminMid, transactionsCont.getOne);

module.exports = transactionsRouter;