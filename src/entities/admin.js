const _ = require("lodash");
const { invalidInput, requiredParamsNotFound } = require("../commons/variables");
exports.makeAdmin = function () {
    return function admin(username, passwordHash) {
        if (_.isUndefined(username) || _.isUndefined(passwordHash)) {
            throw new Error(`${invalidInput}${requiredParamsNotFound}:(username and passwordHash)`);
        } else {
            return Object.freeze({
                username,
                passwordHash
            });
        }
    };
};