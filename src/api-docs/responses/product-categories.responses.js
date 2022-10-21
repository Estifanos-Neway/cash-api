const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/product-categories": {
        "POST": {
            200: ["<productCategoryObject"],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.requiredParamsNotFound)
            ],
            401: [createSingleResponse(rt.unauthorized)],
            409: [createSingleResponse(rt.categoryNameAlreadyExist)]
        },
        "GET": {
            200: [["<productCategoryObject"]],
        }
    },
    "/product-categories/{productId}": {
        "PATCH": {
            200: ["<productCategoryObject"],
            400: [createSingleResponse(rt.invalidInput)],
            404: [createSingleResponse(rt.categoryNotFound)],
            401: [createSingleResponse(rt.unauthorized)],
            409: [createSingleResponse(rt.categoryNameAlreadyExist)]
        },
        "DELETE": {
            200: [createSingleResponse(rt.success)],
            401: [createSingleResponse(rt.unauthorized)],
            404: [createSingleResponse(rt.categoryNotFound)],
        }
    }
};