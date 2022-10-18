const { Admin } = require("../entities");
const { adminsDb, db } = require("../database");
const rt = require("../commons/response-texts");

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
        try {
            // @ts-ignore
            const admin = new Admin({ userId, username: newUsername });
            return await adminsDb.updateOne({ id: userId }, { username: admin.username });
        } catch (error) {
            throw error.message === db.responses.docNotFound ? new Error(rt.userNotFound) : error;
        }

    },
    changePasswordHash: async ({ userId, oldPasswordHash, newPasswordHash }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            try {
                admin.changePasswordHash({ oldPasswordHash, newPasswordHash });
                return await adminsDb.updateOne({ id: userId }, { passwordHash: admin.passwordHash });
            } catch (error) {
                throw error.message === db.responses.docNotFound ? new Error(rt.userNotFound) : error;
            }
        } else {
            throw new Error(rt.userNotFound);
        }
    },
    recoverPasswordHash: async ({ email, newPasswordHash }) => {
        const admin = await adminsDb.findOne({ email });
        if (admin) {
            try {
                admin.changePasswordHash({ oldPasswordHash: admin.passwordHash, newPasswordHash });
                return await adminsDb.updateOne({ email }, { passwordHash: admin.passwordHash });
            } catch (error) {
                throw error.message === db.responses.docNotFound ? new Error(rt.userNotFound) : error;
            }
        } else {
            throw new Error(rt.userNotFound);
        }
    },
    updateSettings: async ({ userId, updates }) => {
        const admin = await adminsDb.findOne({ id: userId });
        if (admin) {
            try {
                admin.updateSettings({ updates });
                const result = await adminsDb.updateOne({ id: userId }, { settings: admin.settings });
                return result.settings;
            } catch (error) {
                throw error.message === db.responses.docNotFound ? new Error(rt.userNotFound) : error;
            }
        } else {
            throw new Error(rt.userNotFound);
        }
    },
    updateEmail: async ({ userId, email }) => {
        try {
            // @ts-ignore
            const admin = new Admin({ userId });
            admin.email = email;
            const result = await adminsDb.updateOne({ id: userId }, { email: admin.email });
            return result.email;
        } catch (error) {
            throw error.message === db.responses.docNotFound ? new Error(rt.userNotFound) : error;
        }
    }
});