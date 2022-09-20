const _ = require("lodash");

exports.makeSignOutCont = (
    jwt, env, checkJwtRefreshRepo, createAccessToken, singleResponse, errorHandler,success,deleteJwtRefreshRepo) => {
    return async (req, res) => {
        try {
            const { refreshToken, accessToken } = req.body;
            if (_.isUndefined(refreshToken) || _.isUndefined(accessToken)) {
                res.status(400).end(singleResponse("Missing_Tokens (accessToken or refreshToken"));
            } else {
                // @ts-ignore
                jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE, (error, user1) => {
                    if (error) {
                        res.status(401).end(singleResponse("Invalid_Refresh_Token"));
                    } else {
                        // @ts-ignore
                        jwt.verify(accessToken, env.JWT_SECRETE, { ignoreExpiration: true }, async (error, user2) => {
                            if (error) {
                                res.status(401).end(singleResponse("Invalid_Access_Token"));
                            } else {
                                // @ts-ignore
                                if (user1.userType === user2.userType && user1.userId === user2.userId) {
                                    await deleteJwtRefreshRepo(refreshToken);
                                    res.end(singleResponse(success));
                                } else {
                                    res.status(401).end(singleResponse("None_Matching_Tokens"));
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