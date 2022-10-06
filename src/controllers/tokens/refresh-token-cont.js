const { hasSingleValue } = require("../../commons/functions");
const { createUserData, getAccessToken } = require("../controller-commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { errorHandler } = require("../controller-commons/functions");
const { createAccessToken, createSingleResponse } = require("../controller-commons/functions");
const { invalidAccessTokenResponseText, invalidRefreshTokenResponseText, invalidInputResponseText } = require("../../commons/variables");

exports.makeRefreshTokenCont = (checkJwtRefreshRepo) => {
    return async (req, res) => {
        try {
            const refreshToken = req.get("refresh-token");
            const accessToken = getAccessToken(req.get("Authorization"));
            if (!hasSingleValue(refreshToken) || !hasSingleValue(accessToken)) {
                res.status(400).json(createSingleResponse(invalidInputResponseText));
            } else {
                const refreshTokenExists = await checkJwtRefreshRepo(refreshToken);
                if (refreshTokenExists) {
                    // @ts-ignore
                    jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE, (error, user1) => {
                        if (error) {
                            res.status(401).json(createSingleResponse(invalidRefreshTokenResponseText));
                        } else {
                            // @ts-ignore
                            jwt.verify(accessToken, env.JWT_SECRETE, { ignoreExpiration: true }, (error, user2) => {
                                if (error) {
                                    res.status(401).json(createSingleResponse(invalidAccessTokenResponseText));
                                } else {
                                    // @ts-ignore
                                    if (user1.userType === user2.userType && user1.userId === user2.userId) {
                                        // @ts-ignore
                                        const userData = createUserData(user1.userId, user1.userType);
                                        const newAccessToken = createAccessToken(userData);
                                        res.json({ newAccessToken });
                                    } else {
                                        res.status(401).json(createSingleResponse("None_Matching_Tokens"));
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.status(401).json(createSingleResponse(`${invalidAccessTokenResponseText} (maybe signed out)`));
                }
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};