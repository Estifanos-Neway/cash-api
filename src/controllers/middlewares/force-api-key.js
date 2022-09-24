const { env } = require("../../env");
const { singleResponse } = require("../controller-commons/functions");
const { invalidApiKeyResponseText } = require("../controller-commons/variables");

exports.makeForceApiKey = () => {
    return (req, res, next) => {
        const apiKey = req.get("api-key");
        if (apiKey !== env.API_KEY) {
            res.status(401).end(singleResponse(invalidApiKeyResponseText));
        } else {
            next();
        }
    };
};