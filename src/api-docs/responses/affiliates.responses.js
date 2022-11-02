const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "affiliate": {
        "/sign-up": {
            "POST": {
                200: ["<verificationTokenObject>"],
                400: [
                    createSingleResponse(rt.invalidFullName),
                    createSingleResponse(rt.invalidPhone),
                    createSingleResponse(rt.invalidEmail),
                    createSingleResponse(rt.invalidPasswordHash)
                ],
                409: [
                    createSingleResponse(rt.affiliateEmailAlreadyExist),
                    createSingleResponse(rt.affiliatePhoneAlreadyExist)
                ]
            }
        },
        "/verify-sign-up": {
            "POST": {
                200: ["<affiliateSignInObject>"],
                400: [
                    createSingleResponse(rt.invalidToken),
                    createSingleResponse(rt.invalidVerificationCode)
                ],
                401: [createSingleResponse(rt.wrongVerificationCode)],
                408: [createSingleResponse(rt.expiredToken)],
                409: [
                    createSingleResponse(rt.affiliateEmailAlreadyExist),
                    createSingleResponse(rt.affiliatePhoneAlreadyExist)
                ]
            }
        },
        "/sign-in": {
            "POST": {
                200: ["<affiliateSignInObject>"],
                400: [
                    createSingleResponse(rt.invalidPhoneOrEmail),
                    createSingleResponse(rt.invalidPasswordHash),
                ],
                401: [createSingleResponse(rt.wrongCredentials)]
            }
        },
        "/": {
            "GET": {
                200: ["<affiliateObjectList>"],
                400: [
                    createSingleResponse(rt.invalidSearchQuery),
                    createSingleResponse(rt.invalidFilterQuery),
                    createSingleResponse(rt.invalidSkipQuery),
                    createSingleResponse(rt.invalidLimitQuery),
                    createSingleResponse(rt.invalidSelectQuery),
                    createSingleResponse(rt.invalidSortQuery),
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/{userId}": {
            "GET": {
                200: ["<affiliateObject>"],
                400: [
                    createSingleResponse(rt.invalidUserId),
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            },
            "DELETE": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidPasswordHash)
                ],
                401: [
                    createSingleResponse(rt.unauthorized),
                    createSingleResponse(rt.wrongPasswordHash)
                ],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/children": {
            "GET": {
                200: ["<affiliateChildrenObjectList>"],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidSearchQuery),
                    createSingleResponse(rt.invalidFilterQuery),
                    createSingleResponse(rt.invalidSkipQuery),
                    createSingleResponse(rt.invalidLimitQuery),
                    createSingleResponse(rt.invalidSortQuery),
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/transactions": {
            "GET": {
                200: ["<transactionObjectsList>"],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidSearchQuery),
                    createSingleResponse(rt.invalidFilterQuery),
                    createSingleResponse(rt.invalidSkipQuery),
                    createSingleResponse(rt.invalidLimitQuery),
                    createSingleResponse(rt.invalidSortQuery),
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/avatar": {
            "PUT": {
                200: ["<avatarObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.requiredParamsNotFound),
                    createSingleResponse(rt.invalidFileFormat)
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            },
            "DELETE": {
                200: [createSingleResponse(rt.success)],
                400: [createSingleResponse(rt.invalidUserId)],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/password": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidPasswordHash),
                    createSingleResponse(rt.wrongPasswordHash)
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/phone": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidPhone),
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)],
                409: [createSingleResponse(rt.affiliatePhoneAlreadyExist)]
            }
        },
        "/{userId}/full-name": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidFullName)
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/{userId}/email": {
            "PATCH": {
                200: ["<verificationTokenObject"],
                400: [
                    createSingleResponse(rt.invalidUserId),
                    createSingleResponse(rt.invalidEmail)
                ],
                401: [createSingleResponse(rt.unauthorized)],
                404: [createSingleResponse(rt.userNotFound)],
                409: [createSingleResponse(rt.affiliateEmailAlreadyExist)]
            }
        },
        "/verify-email": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidToken),
                    createSingleResponse(rt.invalidVerificationCode),
                ],
                401: [
                    createSingleResponse(rt.unauthorized),
                    createSingleResponse(rt.wrongVerificationCode)
                ],
                408: [createSingleResponse(rt.expiredToken)],
                409: [createSingleResponse(rt.affiliateEmailAlreadyExist)]
            }
        },
        "/forgot-password": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [createSingleResponse(rt.invalidEmail)],
                404: [createSingleResponse(rt.userNotFound)]
            }
        },
        "/recover-password": {
            "PATCH": {
                200: [createSingleResponse(rt.success)],
                400: [
                    createSingleResponse(rt.invalidToken),
                    createSingleResponse(rt.invalidPasswordHash),
                ],
                408: [createSingleResponse(rt.expiredToken)],
            }
        }
    }
};