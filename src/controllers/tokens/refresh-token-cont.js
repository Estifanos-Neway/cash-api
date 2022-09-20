const _ = require("lodash");
const { invalidAccessToken } = require("../../commons/variables");

exports.makeRefreshTokenCont = (jwt, env, checkJwtRefreshRepo, createAccessToken, singleResponse, errorHandler) => {
    return async (req, res) => {
        try {
            const { refreshToken } = req.body;
            // eslint-disable-next-line no-unsafe-optional-chaining
            const user1 = req.user;
            if (_.isUndefined(refreshToken) || _.isUndefined(user1)) {
                res.status(400).end(singleResponse("Missing_Tokens (accessToken or refreshToken)"));
            } else {
                const refreshTokenExists = await checkJwtRefreshRepo(refreshToken);
                if (refreshTokenExists) {
                    // @ts-ignore
                    jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE, (error, user2) => {
                        if (error) {
                            res.status(401).end(singleResponse("Invalid_Refresh_Token"));
                        } else {
                            if (user1.userType === user2.userType && user1.userId === user2.userId) {
                                const newAccessToken = createAccessToken(user1);
                                res.end(JSON.stringify({ newAccessToken }));
                            } else {
                                res.status(401).end(singleResponse("None_Matching_Tokens"));
                            }
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