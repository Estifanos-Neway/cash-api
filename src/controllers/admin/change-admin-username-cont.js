const { hasValue } = require("../../commons/functions");
const { invalidInput, requiredParamsNotFound } = require("../../commons/variables");
const { errorHandler } = require("../controller-commons");
const { singleResponse } = require("../controller-commons/functions");
const { successResponseText } = require("../controller-commons/variables");

exports.makeChangeAdminUsernameCont = (changeAdminUsernameRepo) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const newUsername = req.body.newUsername;
            if (!hasValue(newUsername)) {
                throw new Error(`${invalidInput}${requiredParamsNotFound}:(newUsername)`);
            } else {
                await changeAdminUsernameRepo(userId, newUsername);
                res.end(singleResponse(successResponseText));
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};