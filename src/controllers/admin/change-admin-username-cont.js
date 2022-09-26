const { hasValue } = require("../../commons/functions");
const { requiredParamsNotFoundResponseText } = require("../../commons/variables");
const { errorHandler } = require("../controller-commons/functions");
const { createSingleResponse } = require("../controller-commons/functions");
const { successResponseText } = require("../controller-commons/variables");

exports.makeChangeAdminUsernameCont = (changeAdminUsernameRepo) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const newUsername = req.body.newUsername;
            if (!hasValue(newUsername)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const result = await changeAdminUsernameRepo({userId, newUsername});
                if (result.success) {
                    res.end(createSingleResponse(successResponseText));
                } else {
                    res.status(400).end(result.result);
                }
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};