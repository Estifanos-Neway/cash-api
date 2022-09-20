const { admin } = require("../../entities");
exports.makeSigninAdmin = function (adminsDb) {
    return async function signinAdmin(username, passwordHash) {
        const adminToSignin = admin(username, passwordHash);
        return await adminsDb.exists({ username: adminToSignin.username, passwordHash: adminToSignin.passwordHash });
    };
};