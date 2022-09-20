
const express = require("express");
const { defaultPort } = require("./commons/variables");
const { env } = require("./env");
const { adminRouter } = require("./routers");

const app = express();

app.set("port", env.PORT || defaultPort);

app.use(express.json());

app.use("/admin", adminRouter);

app.use((req, res) => {
    res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
});

module.exports = app;