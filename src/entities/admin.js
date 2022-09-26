const { isValidUsername, hasValue } = require("../commons/functions");
const { invalidInput, invalidUsernameResponseText, invalidPasswordHashResponseText, wrongPasswordHashResponseText } = require("../commons/variables");

exports.makeAdmin = () => {
    return class Admin {
        #username;
        #passwordHash;
        #userId;

        get username() { return this.#username; }
        get passwordHash() { return this.#passwordHash; }
        get userId() { return this.#userId; }

        toJson() {
            return Object.freeze(
                {
                    username: this.#username,
                    passwordHash: this.#passwordHash,
                    userId: this.#userId
                }
            );
        }

        constructor({ username, passwordHash, userId }) {
            if (!isValidUsername(username)) {
                throw new Error(`${invalidInput}${invalidUsernameResponseText}`);
            } else {
                this.#username = username;
                this.#passwordHash = passwordHash;
                this.#userId = userId;
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

    };
};