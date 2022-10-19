const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const { sessionsDb } = require("../database");
const { User } = require("../entities");

module.exports = {
    refresh: async (refreshToken) => {
        if (!utils.isNonEmptyString(refreshToken)) {
            throw utils.createError(rt.invalidInput, rc.invalidInput);
        } else {
            const refreshTokenExists = await sessionsDb.exists({ refreshToken });
            if (!refreshTokenExists) {
                throw utils.createError(rt.invalidRefreshToken, rc.unauthorized);
            } else {
                const userFromRefreshToken = User.fromRefreshToken(refreshToken);
                const newAccessToken = userFromRefreshToken.createAccessToken();
                return newAccessToken;
            }
        }
    },
    signOut: async (refreshToken) => {
        if (!utils.isNonEmptyString(refreshToken)) {
            throw utils.createError(rt.invalidInput, rc.invalidInput);
        } else {
            await sessionsDb.deleteOne({ refreshToken });
        }
    },
};