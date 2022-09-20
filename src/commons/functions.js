const color = require("cli-color");

function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}

module.exports = {
    errorLog
};