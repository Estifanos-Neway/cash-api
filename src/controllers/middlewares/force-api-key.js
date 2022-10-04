const { invalidApiKeyResponseText } = require("../../commons/variables");
const { env } = require("../../env");
const { createSingleResponse } = require("../controller-commons/functions");
exports.makeForceApiKey = () => {
    return (req, res, next) => {
        const apiKey = req.get("api-key");
        if (apiKey !== env.API_KEY) {
            res.status(401).end(createSingleResponse(invalidApiKeyResponseText));
        } else {
            next();
        }
    };
};