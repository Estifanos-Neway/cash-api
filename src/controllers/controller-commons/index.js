const { invalidInput } = require("../../commons/variables");
const { singleResponse } = require("./functions");
const { internalError } = require("./variables");

const { makeErrorHandler } = require("./error-handler");

module.exports = {
    errorHandler: makeErrorHandler(invalidInput, internalError, singleResponse)
};