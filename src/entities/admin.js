const { hasValue } = require("../commons/functions");
const { invalidInput, requiredParamsNotFoundResponseText } = require("../commons/variables");

exports.makeAdmin = function () {
    return function admin(username, passwordHash, userId) {
        if (!hasValue(username) || !hasValue(passwordHash)) {
            throw new Error(`${invalidInput}${requiredParamsNotFoundResponseText}:(username or passwordHash)`);
        } else {
            return Object.freeze({
                username,
                passwordHash,
                userId
            });
        }
    };
};