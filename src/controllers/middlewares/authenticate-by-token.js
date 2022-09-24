const { singleResponse } = require("../controller-commons/functions");
const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { invalidAccessToken } = require("../../commons/variables");

exports.makeAuthenticateByToken = () => {
    return (req, res, next) => {
        let accessToken = req.get("Authorization");
        accessToken = accessToken && accessToken.split(" ")[1];
        if (accessToken) {
            try {
                // @ts-ignore
                const userData = jwt.verify(accessToken, env.JWT_SECRETE);
                req.user = userData;
                next();
            } catch (error) {
                res.status(401).end(singleResponse(invalidAccessToken));
            }
        } else {
            next();
        }
    };
};