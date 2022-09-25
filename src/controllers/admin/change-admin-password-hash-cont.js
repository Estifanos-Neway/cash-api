const { hasValue } = require("../../commons/functions");
const { requiredParamsNotFoundResponseText } = require("../../commons/variables");
const { errorHandler } = require("../controller-commons/functions");
const { createSingleResponse } = require("../controller-commons/functions");
const { successResponseText } = require("../controller-commons/variables");

exports.makeChangeAdminPasswordHashCont = (changeAdminPasswordHashRepo) => {
    return async (req, res) => {
        try {
            const userId = req.user.userId;
            const { oldPasswordHash, newPasswordHash } = req.body;
            if (!hasValue(oldPasswordHash) || !hasValue(newPasswordHash)) {
                res.status(400).end(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                const result = await changeAdminPasswordHashRepo(userId, oldPasswordHash, newPasswordHash);
                if (result.success) {
                    res.end(createSingleResponse(successResponseText));
                } else {
                    res.status(400).end(createSingleResponse(result.result));
                }
            }
        } catch (error) {
            errorHandler(error, res);
        }
    };
};