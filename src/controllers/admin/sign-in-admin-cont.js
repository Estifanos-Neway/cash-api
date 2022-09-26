const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { errorHandler } = require("../controller-commons/functions");
const { createSingleResponse, createAccessToken } = require("../controller-commons/functions");
const { notFound } = require("../controller-commons/variables");
const { createUserData } = require("../controller-commons/functions");

exports.makeSignInAdminCont = ({ signInAdminRepo, addJwtRefreshRepo }) => {
    return async (req, res) => {
        try {
            const { username, passwordHash } = req.body;
            const signedInAdmin = await signInAdminRepo({ username, passwordHash });
            if (signedInAdmin) {
                const userData = createUserData(signedInAdmin.userId, "admin");
                // @ts-ignore
                const accessToken = createAccessToken(userData);
                // @ts-ignore
                const refreshToken = jwt.sign(userData, env.JWT_REFRESH_SECRETE);
                await addJwtRefreshRepo(refreshToken);
                const response = {
                    admin: signedInAdmin.toJson(),
                    accessToken,
                    refreshToken
                };
                res.end(JSON.stringify(response));
            } else {
                res.status(404).end(createSingleResponse(notFound));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};