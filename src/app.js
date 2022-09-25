
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const { authenticateByToken, forceApiKey } = require("./controllers/middlewares");
const { env } = require("./env");

exports.makeApp = (defaultPort, adminRouter, tokensRouter) => {
    const app = express();
    app.set("port", env.PORT || defaultPort);

    // swagger
    const swaggerDoc = require("./swagger/swagger.json");
    const { singleResponse } = require("./controllers/controller-commons/functions");
    const swaggerOptions = {
        explorer: true
    };
    app.use("/docs", (req, res, next) => {
        // @ts-ignore
        swaggerDoc.host = req.get("host");
        req.swaggerDoc = swaggerDoc;
        next();
    }, swaggerUi.serveFiles(swaggerDoc, swaggerOptions), swaggerUi.setup());

    // Security
    app.set("trust proxy", 1);
    // @ts-ignore
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 10,
        message: singleResponse("Too_Many_Requests"),
        skipSuccessfulRequests: true,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use(helmet.hidePoweredBy());
    app.use(limiter);
    app.use(cors(
        {
            origin: env.CORS_WHITE_LIST?.split(","),
            optionsSuccessStatus: 200
        }
    ));

    // middleware configurations
    app.use(morgan("combined"));
    app.use(express.json());
    app.use(authenticateByToken);

    // Routes
    app.use(forceApiKey);
    app.use("/admins", adminRouter);
    app.use("/tokens", tokensRouter);

    app.use("*", (req, res) => {
        res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
    });
    return app;
};