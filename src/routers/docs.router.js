const swaggerUi = require("swagger-ui-express");
const express = require("express");
const { Responses } = require("../api-docs/responses.doc");
const swaggerDoc = require("../api-docs/swagger.json");

exports.makeDocsRouter = () => {
    const docsRouter = express.Router();
    // swagger
    const swaggerOptions = {
        // explorer: true,
        customCssUrl: "/swagger.css"
    };
    docsRouter.get("", swaggerUi.serve, swaggerUi.setup(swaggerDoc, swaggerOptions));
    docsRouter.get("/responses", (req, res) => {
        res.json({ Responses });
    });
    return docsRouter;
};