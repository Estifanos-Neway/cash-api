const adminResponses = require("./admin.responses");
const sessionsResponses = require("./sessions.responses");
const productCategoriesResponses = require("./product-categories.responses");
const productsResponses = require("./products.responses");
const affiliatesResponses = require("./affiliates.responses");
const ordersResponses = require("./orders.responses");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

exports.Responses = {
    "any": {
        401: [createSingleResponse(rt.invalidApiKey)],
        500: [createSingleResponse(rt.internalError)]
    },
    ...adminResponses,
    ...sessionsResponses,
    ...productCategoriesResponses,
    ...productsResponses,
    ...affiliatesResponses,
    ...ordersResponses
};
