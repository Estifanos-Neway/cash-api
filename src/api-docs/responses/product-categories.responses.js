const {
    invalidInputResponseText,
    successResponseText,
    requiredParamsNotFoundResponseText,
    categoryNameAlreadyExistResponseText,
    categoryNotFoundResponseText,
    invalidAccessTokenResponseText
} = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/product-categories": {
        "POST": {
            200: ["<productCategoryObject"],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(requiredParamsNotFoundResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            409: [createSingleResponse(categoryNameAlreadyExistResponseText)]
        },
        "GET": {
            200: [["<productCategoryObject"]],
        }
    },
    "/product-categories/{productId}": {
        "PATCH": {
            200: ["<productCategoryObject"],
            400: [createSingleResponse(invalidInputResponseText)],
            404: [createSingleResponse(categoryNotFoundResponseText)],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            409: [createSingleResponse(categoryNameAlreadyExistResponseText)]
        },
        "DELETE": {
            200: [createSingleResponse(successResponseText)],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(categoryNotFoundResponseText)],
        }
    }
};