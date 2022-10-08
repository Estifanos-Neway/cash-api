const _ = require("lodash");
const { invalidAccessTokenResponseText } = require("../../commons/response-texts");
const { createSingleResponse } = require("../controller-commons/functions");

module.exports = (allowedUsers) => {
    allowedUsers = _.isArray(allowedUsers) ? allowedUsers : [];
    return (req, res, next) => {
        const user = req.user;
        if (_.isPlainObject(user) && (_.isEmpty(allowedUsers) || allowedUsers.includes(user.userType))) {
            next();
        } else {
            res.status(401).json(createSingleResponse(invalidAccessTokenResponseText));
        }
    };
};