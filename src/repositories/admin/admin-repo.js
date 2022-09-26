const { createResult } = require("../../commons/functions");
const { adminNotFoundResponseText } = require("../../commons/variables");

exports.makeSignUpAdminRepo = function ({ Admin, adminsDb }) {
    return async ({ username, passwordHash }) => {
        const adminToSignUp = new Admin({ username, passwordHash });
        await adminsDb.create(adminToSignUp);
    };
};

exports.makeSignInAdminRepo = ({ Admin, adminsDb }) => {
    return async ({ username, passwordHash }) => {
        const admin = new Admin({ username, passwordHash });
        const signedInAdmin = await adminsDb.findOne({ username: admin.username, passwordHash: admin.passwordHash });
        if (signedInAdmin) {
            return new Admin({
                username: signedInAdmin.username,
                userId: signedInAdmin.userId
            });
        } else {
            return false;
        }
    };
};

exports.makeChangeAdminUsernameRepo = ({ adminsDb }) => {
    return async ({ userId, newUsername }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.changeUsername({ newUsername });
            await adminsDb.updateOne({ id: userId }, { username: admin.username });
            return createResult(true);
        } else {
            return createResult(false, adminNotFoundResponseText);
        }
    };
};

exports.makeChangeAdminPasswordHashRepo = ({ adminsDb }) => {
    return async ({ userId, oldPasswordHash, newPasswordHash }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.changePasswordHash({ oldPasswordHash, newPasswordHash });
            await adminsDb.updateOne({ id: userId }, { passwordHash: admin.passwordHash });
            return createResult(true);
        } else {
            return createResult(false, adminNotFoundResponseText);
        }
    };
};