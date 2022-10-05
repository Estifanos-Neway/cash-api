
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

    app.use(express.static("src/public"));
    // swagger
    const swaggerDoc = require("./swagger.json");
    const { createSingleResponse } = require("./controllers/controller-commons/functions");
    const swaggerOptions = {
        // explorer: true,
        customCssUrl: "/swagger.css"
    };
    
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, swaggerOptions));
    // Security
    app.set("trust proxy", 1);
    // @ts-ignore
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 10,
        message: createSingleResponse("Too_Many_Requests"),
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
    app.use(morgan("dev"));
    app.use(express.json());

    // Routes
    app.use(forceApiKey);
    app.use(authenticateByToken);
    app.use("/tokens", tokensRouter);
    app.use("/admin", adminRouter);

    app.use("*", (req, res) => {
        res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
    });
    return app;
};