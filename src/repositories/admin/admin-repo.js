const { createResult } = require("../../commons/functions");
const { invalidPasswordHashResponseText } = require("../../commons/variables");

exports.makeSignUpAdminRepo = function (admin, adminsDb) {
    return async (username, passwordHash) => {
        const adminToSignUp = admin(username, passwordHash);
        await adminsDb.create({ username: adminToSignUp.username, passwordHash: adminToSignUp.passwordHash });
    };
};

exports.makeSignInAdminRepo = (admin, adminsDb) => {
    return async (username, passwordHash) => {
        const adminToSignIn = admin(username, passwordHash);
        const signedInAdmin = await adminsDb.findOne({ username: adminToSignIn.username, passwordHash: adminToSignIn.passwordHash });
        if (signedInAdmin) {
            return {
                username: signedInAdmin.username,
                userId: signedInAdmin.userId
            };
        } else {
            return false;
        }
    };
};

exports.makeChangeAdminUsernameRepo = (adminsDb) => {
    return async (userId, newUsername) => await adminsDb.updateOne({ id: userId }, { username: newUsername });
};

exports.makeChangeAdminPasswordHashRepo = (adminsDb) => {
    return async (userId, oldPasswordHash, newPasswordHash) => {
        const adminExists = await adminsDb.exists({ id: userId, passwordHash: oldPasswordHash });
        if (adminExists) {
            await adminsDb.updateOne({ id: userId }, { passwordHash: newPasswordHash });
            return createResult(true);
        } else {
            return createResult(false, invalidPasswordHashResponseText);
        }
    };
};