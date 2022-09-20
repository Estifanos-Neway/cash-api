const jwt = require("jsonwebtoken");
const { env } = require("../../env");
const { signInAdmin } = require("../../repositories/admin");
const { addJwtRefresh } = require("../../repositories/jwt-refresh");
const { errorHandler } = require("../controller-commons");
const { singleResponse } = require("../controller-commons/functions");
const { notFound } = require("../controller-commons/variables");

exports.makeSignInAdminController = function () {
    return async function signInAdminController(req, res) {
        try {
            const { username, passwordHash } = req.body;
            const signedInAdmin = await signInAdmin(username, passwordHash);
            if (signedInAdmin) {
                // @ts-ignore
                const token = jwt.sign({ username: signedInAdmin.username }, env.JWT_SECRETE, { expiresIn: "10m" });
                // @ts-ignore
                const refreshToken = jwt.sign({ username: signedInAdmin.username }, env.JWT_REFRESH_SECRETE);
                await addJwtRefresh(refreshToken);
                const response = {
                    admin: signedInAdmin,
                    token,
                    refreshToken
                };
                res.end(JSON.stringify(response));
            } else {
                res.status(404).end(singleResponse(notFound));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};