const { defaultCommissionRate } = require("../configs");
const { hasValue, isEmail, hasSingleValue, removeUndefined } = require("../commons/functions");
const rt = require("../commons/response-texts");

class AdminSettings {
    commissionRate = defaultCommissionRate;

    constructor({ commissionRate = defaultCommissionRate }) {
        this.commissionRate = commissionRate;
    }

    toJson() {
        return removeUndefined({
            commissionRate: this.commissionRate
        });
    }
}

module.exports = class Admin {
    #username;
    #passwordHash;
    #email;
    #userId;
    // @ts-ignore
    #settings = new AdminSettings({});

    get username() { return this.#username; }
    get passwordHash() { return this.#passwordHash; }
    get email() { return this.#email; }
    get userId() { return this.#userId; }
    get settings() { return this.#settings.toJson(); }


    set username(newUsername) {
        if (hasValue(newUsername)) {
            if (hasSingleValue(newUsername)) {
                this.#username = newUsername;
            } else {
                throw new Error(rt.invalidUsername );
            }
        }
    }

    set passwordHash(newPasswordHash) {
        if (hasValue(newPasswordHash)) {
            if (hasSingleValue(newPasswordHash)) {
                this.#passwordHash = newPasswordHash;
            } else {
                throw new Error(rt.invalidPasswordHash );
            }
        }
    }

    set email(newEmail) {
        if (hasValue(newEmail)) {
            if (isEmail(newEmail)) {
                this.#email = newEmail;
            } else {
                throw new Error(rt.invalidEmail );
            }
        }
    }

    set userId(newUserId) {
        if (hasValue(newUserId)) {
            if (hasSingleValue(newUserId)) {
                this.#userId = newUserId;
            } else {
                throw new Error(rt.invalidUserId );
            }
        }
    }

    constructor({ username, passwordHash, email, userId, settings }) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
        this.userId = userId;
        this.#settings = new AdminSettings({ ...settings });
    }

    toJson() {
        return removeUndefined(
            {
                username: this.username,
                passwordHash: this.passwordHash,
                email: this.email,
                userId: this.userId,
                settings: this.settings
            }
        );
    }

    changePasswordHash({ oldPasswordHash, newPasswordHash }) {
        if (oldPasswordHash !== this.passwordHash) {
            throw new Error(rt.wrongPasswordHash );
        } else {
            this.passwordHash = newPasswordHash;
        }
    }

    updateSettings({ updates }) {
        for (const [name, value] of Object.entries(updates)) {
            this.#settings[name] = value;
        }
    }

};