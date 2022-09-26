const _ = require("lodash");
const { defaultCommissionRate } = require("../config.json");
const { isValidUsername, hasValue } = require("../commons/functions");
const { invalidInput, invalidUsernameResponseText, invalidPasswordHashResponseText, wrongPasswordHashResponseText, invalidCommissionRateResponseText } = require("../commons/variables");

function adaptCommissionRate(commissionRate) {
    if (!_.isNumber(commissionRate)) {
        throw new Error(`${invalidInput}${invalidCommissionRateResponseText}`);
    } else if (commissionRate < 0) {
        return 0;
    } else if (commissionRate > 100) {
        return 100;
    } else {
        return commissionRate;
    }
}

class AdminSettings {
    #commissionRate = defaultCommissionRate;

    constructor({ commissionRate }) {
        if (hasValue(commissionRate)) {
            this.#commissionRate = adaptCommissionRate(commissionRate);
        }
    }

    set commissionRate(newCommissionRate) {
        this.#commissionRate = adaptCommissionRate(newCommissionRate);
    }

    toJson() {
        return {
            commissionRate: this.#commissionRate
        };
    }
}
exports.makeAdmin = () => {
    return class Admin {
        #username;
        #passwordHash;
        #userId;
        // @ts-ignore
        #settings = new AdminSettings({});

        get username() { return this.#username; }
        get passwordHash() { return this.#passwordHash; }
        get userId() { return this.#userId; }
        get settings() { return this.#settings.toJson(); }

        toJson() {
            return Object.freeze(
                {
                    username: this.#username,
                    passwordHash: this.#passwordHash,
                    userId: this.#userId,
                    settings: this.#settings.toJson()
                }
            );
        }

        constructor({ username, passwordHash, userId, settings }) {
            if (!isValidUsername(username)) {
                throw new Error(`${invalidInput}${invalidUsernameResponseText}`);
            } else {
                this.#username = username;
                this.#passwordHash = passwordHash;
                this.#userId = userId;
                this.#settings = new AdminSettings({ ...settings });
            }
        }

        changeUsername({ newUsername }) {
            if (!isValidUsername(newUsername)) {
                throw new Error(`${invalidInput}${invalidUsernameResponseText}`);
            } else {
                this.#username = newUsername;
            }
        }

        changePasswordHash({ oldPasswordHash, newPasswordHash }) {
            if (!hasValue(newPasswordHash)) {
                throw new Error(`${invalidInput}${invalidPasswordHashResponseText}`);
            } else if (oldPasswordHash !== this.#passwordHash) {
                throw new Error(`${invalidInput}${wrongPasswordHashResponseText}`);
            } else {
                this.#passwordHash = newPasswordHash;
            }
        }

        updateSettings({ updates }) {
            for (const [name, value] of Object.entries(updates)) {
                this.#settings[name] = value;
            }
        }

    };
};