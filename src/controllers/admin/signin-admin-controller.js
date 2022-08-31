const { signinAdmin } = require("../../repositories/admin");
const { errorHandler } = require("../controller-commons");
const { singleResponse } = require("../controller-commons/functions");
const { success, notFound } = require("../controller-commons/variables");

exports.makeSigninAdminController = function () {
    return async function signinAdminController(req, res) {
        const { username, passwordHash } = req.body;
        try {
            const adminSignedIn = await signinAdmin(username, passwordHash);
            if (adminSignedIn) {
                // TODO: add JWT
                res.end(singleResponse(success));
            } else {
                res.status(404).end(singleResponse(notFound));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};