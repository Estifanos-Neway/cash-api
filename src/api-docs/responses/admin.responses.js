const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/admin/sign-in": {
        "POST": {
            200: ["<adminSignInDataObject>"],
            400: [createSingleResponse(rt.invalidInput)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin": {
        "GET": {
            200: ["<adminDataObject>"],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin/username": {
        "PATCH": {
            200: [createSingleResponse(rt.success)],
            400: [
                createSingleResponse(rt.invalidInput),
            ],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin/password-hash": {
        "PATCH": {
            200: [createSingleResponse(rt.success)],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.wrongPasswordHash)
            ],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin/settings": {
        "GET": {
            200: ["<adminSettingsObject>"],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        },
        "PATCH": {
            200: ["<adminSettingsObject>"],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.invalidCommissionRate)
            ],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin/email": {
        "PUT": {
            200: [
                { verificationToken: "<verificationToken>" }
            ],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.invalidEmail)
            ],
            401: [createSingleResponse(rt.invalidAccessToken)],
            404: [createSingleResponse(rt.userNotFound)]
        }
    },
    "/admin/verify-email": {
        "PUT": {
            200: [{ newEmail: "<newEmail>" }],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.invalidEmail),
                createSingleResponse(rt.invalidToken),
                createSingleResponse(rt.invalidVerificationCode),
                createSingleResponse(rt.userNotFound)
            ],
            401: [createSingleResponse(rt.invalidAccessToken)],
            408: [createSingleResponse(rt.expiredToken)]
        }
    },
    "/admin/forgot-password": {
        "PUT": {
            200: [createSingleResponse(rt.success)],
            400: [
                createSingleResponse(rt.invalidEmail),
                createSingleResponse(rt.requiredParamsNotFound)
            ],
            404: [
                createSingleResponse(rt.userNotFound),
                createSingleResponse(rt.cantFindValidEmail)
            ]
        }
    },
    "/admin/recover-password": {
        "PUT": {
            200: [createSingleResponse(rt.success)],
            400: [
                createSingleResponse(rt.invalidInput),
                createSingleResponse(rt.invalidToken)
            ],
            404: [createSingleResponse(rt.userNotFound)],
            408: [createSingleResponse(rt.expiredToken)]
        }
    }
};