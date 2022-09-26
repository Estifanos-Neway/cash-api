const color = require("cli-color");
const _ = require("lodash");
function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}

function hasValue(element) {
    if (_.isNumber(element)) return true;
    else if (_.isUndefined(element) || _.isEmpty(element)) return false;
    else return true;
}

function createResult(success, result) {
    return { success, result: _.isUndefined(result) ? null : result };
}

function isValidUsername(username) {
    return hasValue(username) && (_.isString(username) || _.isNumber(username));
}
module.exports = {
    errorLog,
    hasValue,
    createResult,
    isValidUsername
};