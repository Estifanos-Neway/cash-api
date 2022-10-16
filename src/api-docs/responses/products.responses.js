const {
    invalidInputResponseText,
    successResponseText,
    requiredParamsNotFoundResponseText,
    invalidJsonStringResponseText,
    productNameAlreadyExistResponseText,
    invalidSearchQueryResponseText,
    productNotFoundResponseText,
    invalidFilterQueryResponseText,
    invalidCategoriesQueryResponseText,
    invalidSelectQueryResponseText,
    invalidSkipQueryResponseText,
    invalidSortQueryResponseText,
    invalidAccessTokenResponseText
} = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/products": {
        "POST": {
            200: ["<productObject"],
            400: [
                createSingleResponse(invalidJsonStringResponseText),
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(productNameAlreadyExistResponseText),
                createSingleResponse(requiredParamsNotFoundResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
        },
        "GET": {
            200: [["<productObject"]],
            400: [
                createSingleResponse(invalidSearchQueryResponseText),
                createSingleResponse(invalidFilterQueryResponseText),
                createSingleResponse(invalidCategoriesQueryResponseText),
                createSingleResponse(invalidSelectQueryResponseText),
                createSingleResponse(invalidSkipQueryResponseText),
                createSingleResponse(invalidSortQueryResponseText)
            ]
        }
    },
    "/products/{productId}": {
        "GET": {
            200: [["<productObject"]],
            404: [createSingleResponse(productNotFoundResponseText)]

        },
        "PATCH": {
            200: ["<productObject"],
            400: [
                createSingleResponse(invalidJsonStringResponseText),
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(productNameAlreadyExistResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(productNotFoundResponseText)]
        },
        "DELETE": {
            200: [createSingleResponse(successResponseText)],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(productNotFoundResponseText)]
        }
    }
};