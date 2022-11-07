const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/contact-us": {
        "/": {
            "POST": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidFullName),
                    createSingleResponse(rt.invalidPhone),
                    createSingleResponse(rt.invalidEmail),
                    createSingleResponse(rt.invalidAddress),
                    createSingleResponse(rt.invalidMessage)
                ]
            }
        }
    }
};