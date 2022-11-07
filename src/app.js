
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
const config = require("./configs");
const rt = require("./commons/response-texts");
const {
    defaultPort,
    numberOfMaxApiRequestsPerMin } = require("./commons/variables");
const apiResponses = require("./api-docs/responses");
const {
    adminRouter,
    sessionsRouter,
    productsRouter,
    imagesRouter,
    productCategoriesRouter,
    affiliatesRouter,
    ordersRouter,
    transactionsRouter,
    staticWebContentsRouter,
    analyticsRouter,
    contactUsRouter } = require("./routers");
const { createSingleResponse } = require("./controllers/controller-commons/functions");

exports.makeApp = () => {
    const app = express();
    app.set("port", env.PORT || defaultPort);

    // swagger
    const swaggerDoc = require("./api-docs/swagger.json");
    const swaggerOptions = {
        // explorer: true,
        customCssUrl: "/swagger.css"
    };
    console.dir(config.corsWhiteList,{depth:null});
    app.use(morgan("dev"));
    app.use(cors(
        {
            origin: config.corsWhiteList,
            optionsSuccessStatus: 200
        }
    ));
    app.use(express.static("src/public"));
    app.get("/docs/responses", (req, res) => {
        res.json(apiResponses);
    });
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, swaggerOptions));
    app.use("/images", imagesRouter);

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
    app.use(limiter);
    app.use(helmet.hidePoweredBy());
    app.use(express.json());

    // Routes
    app.use(forceApiKey);
    app.use(authenticateByToken);
    app.use("/sessions", sessionsRouter);
    app.use("/admin", adminRouter);
    app.use("/product-categories", productCategoriesRouter);
    app.use("/products", productsRouter);
    app.use("/affiliates", affiliatesRouter);
    app.use("/orders", ordersRouter);
    app.use("/transactions", transactionsRouter);
    app.use("/static-web-contents", staticWebContentsRouter);
    app.use("/analytics", analyticsRouter);
    app.use("/contact-us", contactUsRouter);


    app.use("*", (req, res) => {
        res.status(404).json(createSingleResponse(rt.pathNotFound));
    });

    return app;
};