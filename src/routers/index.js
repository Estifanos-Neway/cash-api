const express = require("express");
const { signInAdminCont } = require("../controllers/admin");
const { refreshTokenCont } = require("../controllers/tokens");
const { makeAdminRouter } = require("./admin-router");
const { makeTokensRouter } = require("./tokens-router");

module.exports = {
    adminRouter: makeAdminRouter(express, signInAdminCont),
    tokensRouter: makeTokensRouter(express, refreshTokenCont)
};