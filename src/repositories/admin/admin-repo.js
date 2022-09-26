const { createResult } = require("../../commons/functions");
const { adminNotFoundResponseText } = require("../../commons/variables");

function createAdminInfo(admin) {
    return Object.freeze({
        userId: admin.userId,
        username: admin.username,
        settings: admin.settings
    });
}

exports.makeSignUpAdminRepo = function ({ Admin, adminsDb }) {
    return async ({ username, passwordHash }) => {
        const adminToSignUp = new Admin({ username, passwordHash });
        await adminsDb.create(adminToSignUp);
    };
};

exports.makeGetAdminRepo = ({ adminsDb }) => {
    return async ({ userId }) => {
        const admin = await adminsDb.findOne({ userId });
        if (admin) {
            return createAdminInfo(admin);
        } else {
            return null;
        }
    };
};

exports.makeSignInAdminRepo = ({ Admin, adminsDb }) => {
    return async ({ username, passwordHash }) => {
        const admin = new Admin({ username, passwordHash });
        const signedInAdmin = await adminsDb.findOne({ username: admin.username, passwordHash: admin.passwordHash });
        if (signedInAdmin) {
            return createAdminInfo(signedInAdmin);
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

exports.makeUpdateAdminSettingsRepo = ({ adminsDb }) => {
    return async ({ userId, updates }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.updateSettings({ updates });
            const result = await adminsDb.updateOne({ id: userId }, { settings: admin.settings });
            return createResult(true, result.settings);
        } else {
            return createResult(false, adminNotFoundResponseText);
        }
    };
};