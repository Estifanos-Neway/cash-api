const { hasSingleValue } = require("../../commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { errorHandler } = require("../controller-commons/functions");
const { createSingleResponse, getAccessToken } = require("../controller-commons/functions");
const {
    invalidAccessTokenResponseText,
    invalidRefreshTokenResponseText,
    invalidInputResponseText,
    successResponseText } = require("../../commons/variables");

exports.makeSignOutCont = (deleteJwtRefreshRepo) => {
    return async (req, res) => {
        try {
            const refreshToken = req.get("refresh-token");
            const accessToken = getAccessToken(req.get("Authorization"));
            if (!hasSingleValue(refreshToken) || !hasSingleValue(accessToken)) {
                res.status(400).end(createSingleResponse(invalidInputResponseText));
            } else {
                // @ts-ignore
                jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE, (error, user1) => {
                    if (error) {
                        res.status(401).end(createSingleResponse(invalidRefreshTokenResponseText));
                    } else {
                        // @ts-ignore
                        jwt.verify(accessToken, env.JWT_SECRETE, { ignoreExpiration: true }, async (error, user2) => {
                            if (error) {
                                res.status(401).end(createSingleResponse(invalidAccessTokenResponseText));
                            } else {
                                // @ts-ignore
                                if (user1.userType === user2.userType && user1.userId === user2.userId) {
                                    await deleteJwtRefreshRepo(refreshToken);
                                    res.end(createSingleResponse(successResponseText));
                                } else {
                                    res.status(401).end(createSingleResponse("None_Matching_Tokens"));
                                }
                            }
                        });
                    }
                });
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};