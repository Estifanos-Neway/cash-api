const { sessionsDb } = require("../database");
const { User, Session } = require("../entities");

module.exports = {
    startSession: async ({ userId, userType }) => {
        const user = new User({ userId, userType });
        const refreshToken = user.createRefreshToken();
        const accessToken = user.createAccessToken();
        const session = new Session({ user: user.toJson(), refreshToken });
        await sessionsDb.create(session);
        return { refreshToken, accessToken };
    }
};