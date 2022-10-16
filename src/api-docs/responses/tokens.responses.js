const {
    invalidInputResponseText,
    successResponseText,
    invalidRefreshTokenResponseText,
    invalidAccessTokenResponseText,
    noneMatchingTokensResponseText,
} = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/tokens/refresh": {
        "GET": {
            200: [{ newAccessToken: "<newAccessToken>" }],
            400: [createSingleResponse(invalidInputResponseText)],
            401: [
                createSingleResponse(invalidRefreshTokenResponseText),
                createSingleResponse(invalidAccessTokenResponseText),
                createSingleResponse(noneMatchingTokensResponseText)
            ]
        }
    },
    "/tokens/sign-out": {
        "DELETE": {
            200: [createSingleResponse(successResponseText)],
            400: [createSingleResponse(invalidInputResponseText)],
            401: [
                createSingleResponse(invalidRefreshTokenResponseText),
                createSingleResponse(invalidAccessTokenResponseText),
                createSingleResponse(noneMatchingTokensResponseText)
            ]
        }
    },
};