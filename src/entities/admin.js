const _ = require("lodash");
const { defaultCommissionRate } = require("../config.json");
const { hasValue, isEmail, hasSingleValue } = require("../commons/functions");
const {
    invalidInput,
    invalidPasswordHashResponseText,
    wrongPasswordHashResponseText,
    invalidCommissionRateResponseText,
    invalidEmailResponseText } = require("../commons/variables");

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

    constructor({ commissionRate = defaultCommissionRate }) {
        this.commissionRate = commissionRate;
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
        #email;
        #userId;
        // @ts-ignore
        #settings = new AdminSettings({});

        get username() { return this.#username; }
        get passwordHash() { return this.#passwordHash; }
        get email() { return this.#email; }
        get userId() { return this.#userId; }
        get settings() { return this.#settings.toJson(); }

        set email(newEmail) {
            if (hasValue(newEmail)) {
                if (isEmail(newEmail)) {
                    this.#email = newEmail;
                } else {
                    throw new Error(`${invalidInput}${invalidEmailResponseText}`);
                }
            }
        }

        toJson() {
            return Object.freeze(
                {
                    username: this.username,
                    passwordHash: this.passwordHash,
                    email: this.email,
                    userId: this.userId,
                    settings: this.settings
                }
            );
        }

        constructor({ username, passwordHash, email, userId, settings }) {
            this.#username = username;
            this.#passwordHash = passwordHash;
            this.email = email;
            this.#userId = userId;
            this.#settings = new AdminSettings({ ...settings });
        }

        changePasswordHash({ oldPasswordHash, newPasswordHash }) {
            if (!hasSingleValue(newPasswordHash)) {
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