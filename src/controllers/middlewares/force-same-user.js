const _ = require("lodash");
const { sendUnauthorizedResponse } = require("../controller-commons/functions");

module.exports = (checkedUserTypes) => {
    checkedUserTypes = _.isArray(checkedUserTypes) ? checkedUserTypes : [];
    return (req, res, next) => {
        const userId = req.params.userId;
        if (checkedUserTypes.includes(req.user.userType) && userId !== req.user.userId) {
            sendUnauthorizedResponse(res);
        } else {
            next();
        }
    };
};