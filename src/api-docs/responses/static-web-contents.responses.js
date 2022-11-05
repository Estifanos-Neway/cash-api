const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

module.exports = {
    "/static-web-contents": {
        "/": {
            "PUT": {
                200: ["<staticWebContentsObject>"],
                400: [
                    createSingleResponse(rt.invalidWhoAreWeVideoLink),
                    createSingleResponse(rt.invalidHowToAffiliateWithUsVideoLink)
                ],
                401: [createSingleResponse(rt.unauthorized)]
            },
            "GET": {
                200: ["<staticWebContentsObject>"]
            }
        }
    }
};