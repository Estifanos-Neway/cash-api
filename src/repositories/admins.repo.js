const { Admin } = require("../entities");
const { adminsDb } = require("../database");
const { createResult } = require("../commons/functions");
const { userNotFoundResponseText } = require("../commons/response-texts");

function createAdminInfo(admin) {
    return Object.freeze({
        userId: admin.userId,
        username: admin.username,
        email: admin.email,
        settings: admin.settings
    });
}

module.exports = Object.freeze({
    signUp: async ({ username, passwordHash }) => {
        // @ts-ignore
        const adminToSignUp = new Admin({ username, passwordHash });
        await adminsDb.create(adminToSignUp);
    },
    get: async () => {
        const admin = await adminsDb.findOne();
        if (admin) {
            return createAdminInfo(admin);
        } else {
            return null;
        }
    },
    getSettings: async () => {
        const admin = await adminsDb.findOne({}, ["settings"]);
        if (admin) {
            return admin.settings;
        } else {
            return null;
        }
    },
    signIn: async ({ username, passwordHash }) => {
        // @ts-ignore
        const admin = new Admin({ username, passwordHash });
        const signedInAdmin = await adminsDb.findOne({ username: admin.username, passwordHash: admin.passwordHash });
        if (signedInAdmin) {
            return createAdminInfo(signedInAdmin);
        } else {
            return false;
        }
    },
    changeUsername: async ({ userId, newUsername }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.username = newUsername;
            await adminsDb.updateOne({ id: userId }, { username: admin.username });
            return createResult(true);
        } else {
            return createResult(false, userNotFoundResponseText);
        }
    },
    changePasswordHash: async ({ userId, oldPasswordHash, newPasswordHash }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.changePasswordHash({ oldPasswordHash, newPasswordHash });
            await adminsDb.updateOne({ id: userId }, { passwordHash: admin.passwordHash });
            return createResult(true);
        } else {
            return createResult(false, userNotFoundResponseText);
        }
    },
    recoverPasswordHash: async ({ email, newPasswordHash }) => {
        const admin = await adminsDb.findOne({ email });
        if (admin) {
            admin.changePasswordHash({ oldPasswordHash: admin.passwordHash, newPasswordHash });
            await adminsDb.updateOne({ email }, { passwordHash: admin.passwordHash });
            return createResult(true);
        } else {
            return createResult(false, userNotFoundResponseText);
        }
    },
    updateSettings: async ({ userId, updates }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.updateSettings({ updates });
            const result = await adminsDb.updateOne({ id: userId }, { settings: admin.settings });
            return createResult(true, result.settings);
        } else {
            return createResult(false, userNotFoundResponseText);
        }
    },
    updateEmail: async ({ userId, email }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            admin.email = email;
            const result = await adminsDb.updateOne({ id: userId }, { email: admin.email });
            return createResult(true, result.email);
        } else {
            return createResult(false, userNotFoundResponseText);
        }
    }
});