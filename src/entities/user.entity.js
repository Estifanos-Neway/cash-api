const jwt = require("jsonwebtoken");
const utils = require("../commons/functions");
const vars = require("../commons/variables");
const { env } = require("../env");

module.exports = class User {
    // userTypes
    static #userTypes = Object.freeze({
        Admin: "Admin",
        Affiliate: "Affiliate"
    });
    static get userTypes() {
        return User.#userTypes;
    }

    // userId
    userId;

    // userType
    #userType;
    set userType(userType) {
        this.#userType = User.#userTypes[userType];
    }
    get userType() {
        return this.#userType;
    }

    constructor({ userId, userType }) {
        this.userId = userId;
        this.userType = userType;
    }

    toJson() {
        return utils.removeUndefined({
            userId: this.userId,
            userType: this.userType
        });
    }

    createAccessToken() {
        // @ts-ignore
        return jwt.sign(this.toJson(), env.JWT_SECRETE, { expiresIn: `${vars.accessTokenExpiresIn}ms` });
    }

    createRefreshToken() {
        // @ts-ignore
        return jwt.sign(this.toJson(), env.JWT_REFRESH_SECRETE);
    }

    static fromAccessToken({ accessToken, ignoreExpiration = false }) {
        // @ts-ignore
        const userJson = jwt.verify(accessToken, env.JWT_SECRETE, { ignoreExpiration });
        // @ts-ignore
        return new User(userJson);
    }

    static fromRefreshToken(refreshToken) {
        // @ts-ignore
        const userJson = jwt.verify(refreshToken, env.JWT_REFRESH_SECRETE);
        // @ts-ignore
        return new User(userJson);
    }
};