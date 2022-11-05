const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/transactions": {
        "/": {
            "GET": {
                200: ["<transactionObject>"],
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
        "/{transactionId}": {
            "GET": {
                200: ["<transactionObject>"],
                400: [createSingleResponse(rt.invalidTransactionId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.transactionNotFound)]
            },
        }
    }
};