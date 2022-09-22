const color = require("cli-color");
const _ = require("lodash");
function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}

function hasValue(element) {
    if(_.isNumber(element)) return true;
    else if (_.isUndefined(element) || _.isEmpty(element)) return false;
    else return true;
}
module.exports = {
    errorLog,
    hasValue
};