const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/products": {
        "POST": {
            200: ["<productObject"],
            400: [
                createSingleResponse(rt.invalidJsonString),
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.requiredParamsNotFound)
            ],
            401: [createSingleResponse(rt.unauthorized)],
            409: [createSingleResponse(rt.productNameAlreadyExist)]
        },
        "GET": {
            200: [["<productObject"]],
            400: [
                createSingleResponse(rt.invalidSearchQuery),
                createSingleResponse(rt.invalidFilterQuery),
                createSingleResponse(rt.invalidCategoriesQuery),
                createSingleResponse(rt.invalidSelectQuery),
                createSingleResponse(rt.invalidSkipQuery),
                createSingleResponse(rt.invalidLimitQuery),
                createSingleResponse(rt.invalidSortQuery)
            ]
        }
    },
    "/products/{productId}": {
        "GET": {
            200: [["<productObject"]],
            404: [createSingleResponse(rt.productNotFound)]

        },
        "PATCH": {
            200: ["<productObject"],
            400: [
                createSingleResponse(rt.invalidJsonString),
                createSingleResponse(rt.invalidInput)
            ],
            401: [createSingleResponse(rt.unauthorized)],
            404: [createSingleResponse(rt.productNotFound)],
            409: [createSingleResponse(rt.productNameAlreadyExist)]
        },
        "DELETE": {
            200: [createSingleResponse(rt.success)],
            401: [createSingleResponse(rt.unauthorized)],
            404: [createSingleResponse(rt.productNotFound)]
        }
    }
};