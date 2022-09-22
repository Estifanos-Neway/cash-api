
exports.makeAuthenticateByToken = (env, singleResponse, jwt,invalidAccessToken) => {
    return (req, res, next) => {
        let accessToken = req.get("Authorization");
        accessToken = accessToken && accessToken.split(" ")[1];
        if (accessToken) {
            try {
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