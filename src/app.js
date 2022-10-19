
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const {
    authenticateByToken,
    forceApiKey } = require("./controllers/middlewares");
const { env } = require("./env");
const rt = require("./commons/response-texts");
const {
    defaultPort,
    numberOfMaxApiRequestsPerMin } = require("./commons/variables");
const apiResponses = require("./api-docs/responses");
const { adminRouter, sessionsRouter, productsRouter, imagesRouter, productCategoriesRouter, affiliatesRouter } = require("./routers");

exports.makeApp = () => {
    const app = express();
    app.set("port", env.PORT || defaultPort);

    app.use(express.static("src/public"));
    // swagger
    const swaggerDoc = require("./api-docs/swagger.json");
    const { createSingleResponse } = require("./controllers/controller-commons/functions");
    const swaggerOptions = {
        // explorer: true,
        customCssUrl: "/swagger.css"
    };

    app.get("/docs/responses", (req, res) => {
        res.json(apiResponses);
    });
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, swaggerOptions));
    // Security
    app.set("trust proxy", 1);
    // @ts-ignore
    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: numberOfMaxApiRequestsPerMin,
        message: createSingleResponse(rt.tooManyRequests),
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
    app.use("/images", imagesRouter);
    app.use(forceApiKey);
    app.use(authenticateByToken);
    app.use("/sessions", sessionsRouter);
    app.use("/admin", adminRouter);
    app.use("/product-categories", productCategoriesRouter);
    app.use("/products", productsRouter);
    app.use("/affiliates", affiliatesRouter);

    app.use("*", (req, res) => {
        res.status(404).json(createSingleResponse(rt.pathNotFound));
    });

    return app;
};