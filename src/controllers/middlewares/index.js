const { makeAuthenticateByToken } = require("./authenticate-by-token");
const { makeForceAccessToken } = require("./force-access-token");
const { makeForceApiKey } = require("./force-api-key");
const { makeNotImplementedYet } = require("./not-implemented-yet");

module.exports = {
    authenticateByToken: makeAuthenticateByToken(),
    forceAccessToken: makeForceAccessToken(),
    forceApiKey: makeForceApiKey(),
    notImplementedYet: makeNotImplementedYet()
};