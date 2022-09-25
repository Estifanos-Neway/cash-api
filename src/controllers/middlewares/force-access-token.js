const { hasValue } = require("../../commons/functions");
const { invalidAccessTokenResponseText } = require("../../commons/variables");
const { createSingleResponse } = require("../controller-commons/functions");

exports.makeForceAccessToken = () => {
    return (req, res, next) => {
        if (!hasValue(req.user)) {
            res.status(401).end(createSingleResponse(invalidAccessTokenResponseText));
        } else {
            next();
        }
    };
};