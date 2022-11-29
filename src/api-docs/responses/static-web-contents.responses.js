const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/static-web-contents": {
        "/": {
            "GET": {
                200: ["<staticWebContentsObject>"]
            }
        },
        "/logo-image": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.requiredParamsNotFound)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/hero": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidHeroShortTitle),
                    createSingleResponse(rt.invalidHeroLongTitle),
                    createSingleResponse(rt.invalidHeroDescription)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/about-us-image": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.requiredParamsNotFound)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/why-us": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidWhyUsTitle),
                    createSingleResponse(rt.invalidWhyUsDescription)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/what-makes-us-unique": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidWhatMakesUsUnique)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/who-are-we": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidWhoAreWeDescription),
                    createSingleResponse(rt.invalidWhoAreWeVideoLink)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/how-tos": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidHowToBuyFromUsDescription),
                    createSingleResponse(rt.invalidHowToAffiliateWithUsDescription),
                    createSingleResponse(rt.invalidHowToAffiliateWithUsVideoLink),
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/brands": {
            "POST": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.requiredParamsNotFound),
                    createSingleResponse(rt.invalidBrandLink),
                    createSingleResponse(rt.invalidBrandRank)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/brands/{id}": {
            "PATCH": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidBrandLink),
                    createSingleResponse(rt.invalidBrandRank)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            },
            "DELETE": {
                200: ["<staticWebContentsObject>"],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/social-links": {
            "POST": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.requiredParamsNotFound),
                    createSingleResponse(rt.invalidSocialLinkLink),
                    createSingleResponse(rt.invalidSocialLinkRank)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
        "/social-links/{id}": {
            "PATCH": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidInput),
                    createSingleResponse(rt.invalidFileFormat),
                    createSingleResponse(rt.invalidSocialLinkLink),
                    createSingleResponse(rt.invalidSocialLinkRank)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            },
            "DELETE": {
                200: ["<staticWebContentsObject>"],
                401: [createSingleResponse(rt.unauthorized)]
            }
        },
    }
};