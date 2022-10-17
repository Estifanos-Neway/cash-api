const {
    invalidInputResponseText,
    userNotFoundResponseText,
    successResponseText,
    wrongPasswordHashResponseText,
    invalidCommissionRateResponseText,
    invalidEmailResponseText,
    invalidTokenResponseText,
    expiredTokenResponseText,
    invalidVerificationCodeResponseText,
    cantFindValidEmailResponseText,
    invalidAccessTokenResponseText,
    requiredParamsNotFoundResponseText
} = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/admin/sign-in": {
        "POST": {
            200: ["<adminSignInDataObject>"],
            400: [createSingleResponse(invalidInputResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin": {
        "GET": {
            200: ["<adminDataObject>"],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin/username": {
        "PATCH": {
            200: [createSingleResponse(successResponseText)],
            400: [
                createSingleResponse(invalidInputResponseText),
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin/password-hash": {
        "PATCH": {
            200: [createSingleResponse(successResponseText)],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(wrongPasswordHashResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin/settings": {
        "GET": {
            200: ["<adminSettingsObject>"],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        },
        "PATCH": {
            200: ["<adminSettingsObject>"],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(invalidCommissionRateResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin/email": {
        "PUT": {
            200: [
                { verificationToken: "<verificationToken>" }
            ],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(invalidEmailResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            404: [createSingleResponse(userNotFoundResponseText)]
        }
    },
    "/admin/verify-email": {
        "PUT": {
            200: [{ newEmail: "<newEmail>" }],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(invalidEmailResponseText),
                createSingleResponse(invalidTokenResponseText),
                createSingleResponse(invalidVerificationCodeResponseText),
                createSingleResponse(userNotFoundResponseText)
            ],
            401: [createSingleResponse(invalidAccessTokenResponseText)],
            408: [createSingleResponse(expiredTokenResponseText)]
        }
    },
    "/admin/forgot-password": {
        "PUT": {
            200: [createSingleResponse(successResponseText)],
            400: [
                createSingleResponse(invalidEmailResponseText),
                createSingleResponse(requiredParamsNotFoundResponseText)
            ],
            404: [
                createSingleResponse(userNotFoundResponseText),
                createSingleResponse(cantFindValidEmailResponseText)
            ]
        }
    },
    "/admin/recover-password": {
        "PUT": {
            200: [createSingleResponse(successResponseText)],
            400: [
                createSingleResponse(invalidInputResponseText),
                createSingleResponse(invalidTokenResponseText)
            ],
            404: [createSingleResponse(userNotFoundResponseText)],
            408: [createSingleResponse(expiredTokenResponseText)]
        }
    }
};