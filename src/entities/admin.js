const _ = require("lodash");

exports.makeAdmin = function (invalidInput, requiredParamsNotFound ) {
    return function admin(username, passwordHash) {
        if (_.isUndefined(username) || _.isUndefined(passwordHash)) {
            throw new Error(`${invalidInput}${requiredParamsNotFound}:(username or passwordHash)`);
        } else {
            return Object.freeze({
                username,
                passwordHash
            });
        }
    };
};