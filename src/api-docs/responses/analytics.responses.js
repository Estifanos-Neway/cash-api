const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/analytics": {
        "/counts": {
            "GET": {
                200: ["<analyticsObject>"],
                401: [createSingleResponse(rt.unauthorized)]
            }
        }
    }
};