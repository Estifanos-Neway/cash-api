const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { getAccessToken } = require("../controller-commons/functions");

exports.makeAuthenticateByToken = () => {
    return (req, res, next) => {
        const accessToken = getAccessToken(req.get("Authorization"));
        if (accessToken !== null) {
            // @ts-ignore
            jwt.verify(accessToken, env.JWT_SECRETE, (error, userData) => {
                if (!error) {
                    req.user = userData;
                }
                next();
            });
        } else {
            next();
        }

    };
};