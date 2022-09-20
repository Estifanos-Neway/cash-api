exports.makeSignUpAdminRepo = function (admin, adminsDb) {
    return async (username, passwordHash) => {
        const adminToSignUp = admin(username, passwordHash);
        await adminsDb.create({ username: adminToSignUp.username, passwordHash: adminToSignUp.passwordHash });
    };
};

exports.makeSignInAdminRepo = function (admin, adminsDb) {
    return async (username, passwordHash) => {
        const adminToSignIn = admin(username, passwordHash);
        const signedInAdmin = await adminsDb.findOne({ username: adminToSignIn.username, passwordHash: adminToSignIn.passwordHash });
        if (signedInAdmin) {
            return signedInAdmin;
        } else {
            return false;
        }
    };
};

