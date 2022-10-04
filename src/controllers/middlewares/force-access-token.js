const _ = require("lodash");
const { invalidAccessTokenResponseText } = require("../../commons/variables");
const { createSingleResponse } = require("../controller-commons/functions");

exports.makeForceAccessToken = () => {
    return (allowedUsers) => {
        allowedUsers = _.isArray(allowedUsers) ? allowedUsers : [];
        return (req, res, next) => {
            const user = req.user;
            if (_.isPlainObject(user) && (_.isEmpty(allowedUsers) || allowedUsers.includes(user.userType))) {
                next();
            } else {
                res.status(401).end(createSingleResponse(invalidAccessTokenResponseText));
            }
        };
    };
};