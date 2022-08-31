const _ = require("lodash");

module.exports = function () {
    return function (username, passwordHash) {
        if (_.isUndefined(username) || _.isUndefined(passwordHash)) {
            throw new Error("Required_Params (username and passwordHash)");
        } else {
            return Object.freeze({
                username,
                passwordHash
            });
        }
    };
};