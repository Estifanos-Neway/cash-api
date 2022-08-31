const { admin } = require("../../entities");
module.exports = function (adminsDb) {
    return async function (username, passwordHash) {
        const adminToSignin = admin(username, passwordHash);
        return await adminsDb.exists({ username: adminToSignin.username, passwordHash: adminToSignin.passwordHash });
    };
};