const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/tokens/refresh": {
        "GET": {
            200: [{ newAccessToken: "<newAccessToken>" }],
            400: [createSingleResponse(rt.invalidInput)],
            401: [
                createSingleResponse(rt.invalidRefreshToken),
                createSingleResponse(rt.invalidAccessToken),
                createSingleResponse(rt.noneMatchingTokens)
            ]
        }
    },
    "/tokens/sign-out": {
        "DELETE": {
            200: [createSingleResponse(rt.success)],
            400: [createSingleResponse(rt.invalidInput)],
            401: [
                createSingleResponse(rt.invalidRefreshToken),
                createSingleResponse(rt.invalidAccessToken),
                createSingleResponse(rt.noneMatchingTokens)
            ]
        }
    },
};