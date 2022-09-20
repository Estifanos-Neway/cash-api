const _ = require("lodash");
const { createUserData } = require("../controller-commons/functions");

exports.makeRefreshTokenCont = (jwt, env, checkJwtRefreshRepo, createAccessToken, singleResponse, errorHandler, invalidAccessToken) => {
    return async (req, res) => {
        try {
            const { refreshToken, accessToken } = req.body;
            if (_.isUndefined(refreshToken) || _.isUndefined(accessToken)) {
                res.status(400).end(singleResponse("Missing_Tokens (accessToken or refreshToken"));
            } else {
                const refreshTokenExists = await checkJwtRefreshRepo(refreshToken);
                if (refreshTokenExists) {
                    // @ts-ignore
                    jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE, (error, user1) => {
                        if (error) {
                            res.status(401).end(singleResponse("Invalid_Refresh_Token"));
                        } else {
                            // @ts-ignore
                            jwt.verify(accessToken, env.JWT_SECRETE, { ignoreExpiration: true }, (error, user2) => {
                                if (error) {
                                    res.status(401).end(singleResponse("Invalid_Access_Token"));
                                } else {
                                    // @ts-ignore
                                    if (user1.userType === user2.userType && user1.userId === user2.userId) {
                                        const userData = createUserData(user1.userId, user1.userType);
                                        const newAccessToken = createAccessToken(userData);
                                        res.end(JSON.stringify({ newAccessToken }));
                                    } else {
                                        res.status(401).end(singleResponse("None_Matching_Tokens"));
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.status(401).end(singleResponse(`${invalidAccessToken} (maybe signed out)`));
                }
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};