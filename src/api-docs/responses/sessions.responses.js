const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/sessions": {
        "/refresh": {
            "GET": {
                200: [{ newAccessToken: "<newAccessToken>" }],
                400: [createSingleResponse(rt.invalidInput)],
                401: [createSingleResponse(rt.invalidRefreshToken)]
            }
        },
        "/sign-out": {
            "DELETE": {
                200: [createSingleResponse(rt.success)],
                400: [createSingleResponse(rt.invalidInput)]
            }
        }
    }
};