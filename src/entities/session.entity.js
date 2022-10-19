const _ = require("lodash");
const utils = require("../commons/functions");
const User = require("./user.entity");

module.exports = class Session {
    // sessionId
    sessionId;

    // user
    #user;
    set user(jsonUser) {
        this.#user = _.isPlainObject(jsonUser) ? new User(jsonUser) : undefined;
    }
    get user() {
        return this.#user?.toJson();
    }

    // refreshToken
    refreshToken;

    // startedAt
    startedAt;

    constructor({ sessionId = undefined, user, refreshToken, startedAt = undefined }) {
        this.sessionId = sessionId;
        this.user = user;
        this.refreshToken = refreshToken;
        this.startedAt = startedAt;
    }

    toJson() {
        return utils.removeUndefined({
            sessionId: this.sessionId,
            user: this.user,
            refreshToken: this.refreshToken,
            startedAt: this.startedAt
        });
    }
};