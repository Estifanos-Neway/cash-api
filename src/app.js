
const express = require("express");
const { defaultPort } = require("./commons/variables");
const { authenticateByToken } = require("./controllers/middlewares");
const { env } = require("./env");
const { adminRouter, tokensRouter } = require("./routers");

const app = express();

app.set("port", env.PORT || defaultPort);

app.use(express.json());
app.use(authenticateByToken);

app.use("/admin", adminRouter);
app.use("/tokens", tokensRouter);

app.use((req, res) => {
    res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
});

module.exports = app;