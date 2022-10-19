const { User } = require("../../entities");
const { getAccessToken } = require("../controller-commons/functions");

module.exports = (req, res, next) => {
    const accessToken = getAccessToken(req.get("Authorization"));
    try {
        const user = User.fromAccessToken({ accessToken });
        req.user = user.toJson();
        next();
    } catch (error) {
        next();
    }

};