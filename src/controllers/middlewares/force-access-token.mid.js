const _ = require("lodash");
const rt = require("../../commons/response-texts");
const { createSingleResponse, catchInternalError } = require("../controller-commons/functions");

module.exports = (allowedUsers) => {
    allowedUsers = _.isArray(allowedUsers) ? allowedUsers : [];
    return (req, res, next) => {
        catchInternalError(res, () => {
            const user = req.user;
            if (_.isPlainObject(user) && (_.isEmpty(allowedUsers) || allowedUsers.includes(user.userType))) {
                next();
            } else {
                res.status(401).json(createSingleResponse(rt.unauthorized));
            }
        });
    };
};