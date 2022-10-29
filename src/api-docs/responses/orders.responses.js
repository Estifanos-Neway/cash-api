const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/orders": {
        "/": {
            "POST": {
                200: ["<orderObject"],
                400: [
                    createSingleResponse(rt.invalidProductId),
                    createSingleResponse(rt.requiredParamsNotFound),
                    createSingleResponse(rt.invalidFullName),
                    createSingleResponse(rt.invalidPhone),
                    createSingleResponse(rt.invalidCompanyName),
                ],
                404: [createSingleResponse(rt.productNotFound)]
            },
            "GET": {
                200: [["<orderObject"]],
                400: [
                    createSingleResponse(rt.invalidSearchQuery),
                    createSingleResponse(rt.invalidFilterQuery),
                    createSingleResponse(rt.invalidSkipQuery),
                    createSingleResponse(rt.invalidLimitQuery),
                    createSingleResponse(rt.invalidSelectQuery),
                    createSingleResponse(rt.invalidSortQuery)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/{orderId}": {
            "GET": {
                200: ["<orderObject"],
                400: [createSingleResponse(rt.invalidOrderId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.orderNotFound)]
            },
            "DELETE": {
                200: [createSingleResponse(rt.success)],
                400: [createSingleResponse(rt.invalidOrderId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.orderNotFound)],
                409: [createSingleResponse(rt.pendingOrder)]
            }
        },
        "/{orderId}/accept": {
            "PATCH": {
                200: ["<orderObject"],
                400: [createSingleResponse(rt.invalidOrderId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.orderNotFound)],
                409: [createSingleResponse(rt.orderAlreadyUnpended)]
            }
        },
        "/{orderId}/reject": {
            "PATCH": {
                200: ["<orderObject"],
                400: [createSingleResponse(rt.invalidOrderId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.orderNotFound)],
                409: [createSingleResponse(rt.orderAlreadyUnpended)]
            }
        }
    }
};