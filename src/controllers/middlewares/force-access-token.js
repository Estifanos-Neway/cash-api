const { hasValue } = require("../../commons/functions");

exports.makeForceAccessToken = (singleResponse) => {
    return (req, res, next) => {
        if (!hasValue(req.user)) {
            res.status(401).end(singleResponse("Access_Token_Is_Required"));
        } else {
            next();
        }
    };
};