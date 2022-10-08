const { hasSingleValue } = require("../../commons/functions");
const { invalidApiKeyResponseText } = require("../../commons/response-texts");
const { env } = require("../../env");
const { createSingleResponse } = require("../controller-commons/functions");

module.exports = (req, res, next) => {
    const apiKey = req.get("Api-Key");
    if (!hasSingleValue(apiKey) || apiKey !== env.API_KEY) {
        res.status(401).json(createSingleResponse(invalidApiKeyResponseText));
    } else {
        next();
    }
};