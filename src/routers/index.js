const express = require("express");
const { signInAdminCont } = require("../controllers/admin");
const { refreshTokenCont } = require("../controllers/tokens");
const { signOutCont } = require("../controllers/tokens");
const { forceAccessToken } = require("../controllers/middlewares");
const { changeAdminUsernameCont } = require("../controllers/admin");

const { makeAdminRouter } = require("./admin-router");
const { makeTokensRouter } = require("./tokens-router");

module.exports = {
    adminRouter: makeAdminRouter(express, signInAdminCont, forceAccessToken,changeAdminUsernameCont),
    tokensRouter: makeTokensRouter(express, refreshTokenCont, signOutCont)
};