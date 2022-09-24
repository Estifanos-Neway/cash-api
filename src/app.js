
const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { defaultPort } = require("./commons/variables");
const { authenticateByToken, forceApiKey } = require("./controllers/middlewares");
const { env } = require("./env");
const { adminRouter, tokensRouter } = require("./routers");
const app = express();

app.set("port", env.PORT || defaultPort);

// swagger
const swaggerDoc = require("./swagger/swagger.json");
const swaggerOptions = {
    explorer: true
};

// middleware configurations
app.use(morgan("dev"));
app.use(express.json());
app.use(authenticateByToken);

app.use("/docs", (req, res, next) => {
    // @ts-ignore
    swaggerDoc.host = req.get("host");
    req.swaggerDoc = swaggerDoc;
    next();
}, swaggerUi.serveFiles(swaggerDoc, swaggerOptions), swaggerUi.setup());
app.use(forceApiKey);
app.use("/admins", adminRouter);
app.use("/tokens", tokensRouter);

app.use((req, res) => {
    res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
});

module.exports = app;