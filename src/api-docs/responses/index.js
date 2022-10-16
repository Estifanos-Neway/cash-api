const adminResponses = require("./admin.responses");
const tokensResponses = require("./tokens.responses");
const productCategoriesResponses = require("./product-categories.responses");
const productResponses = require("./products.responses");
const {
    internalErrorResponseText,
    invalidApiKeyResponseText
} = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

exports.Responses = {
    "any": {
        401: [createSingleResponse(invalidApiKeyResponseText)],
        500: [createSingleResponse(internalErrorResponseText)]
    },
    ...adminResponses,
    ...tokensResponses,
    ...productCategoriesResponses,
    ...productResponses
};
