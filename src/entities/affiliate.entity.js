const _ = require("lodash");
const utils = require("../commons/functions");
const Image = require("./entity-commons/image.entity");

module.exports = class Affiliate {
    // userId
    userId;

    // fullName
    fullName;
    hasValidFullName(strict) {
        const fullName = this.fullName;
        return utils.isNonEmptyString(fullName) || (!strict && _.isUndefined(fullName));
    }

    // phone
    #phone;
    set phone(phone) {
        const validPhone = utils.isPhone(phone);
        if (validPhone) {
            this.#phone = validPhone;
        } else {
            this.#phone = phone;
        }
    }
    get phone() {
        return this.#phone;
    }
    hasValidPhone(strict) {
        const phone = this.phone;
        return !!utils.isPhone(phone) || (!strict && _.isUndefined(phone));
    }

    // email
    email;
    hasValidEmail(strict) {
        const email = this.email;
        return utils.isEmail(email) || (!strict && _.isUndefined(email));
    }

    // passwordHash
    passwordHash;
    hasValidPasswordHash(strict) {
        const passwordHash = this.passwordHash;
        return utils.isNonEmptyString(passwordHash) || (!strict && _.isUndefined(passwordHash));
    }

    // avatar
    #avatar;
    set avatar(imageJson) {
        this.#avatar = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get avatar() {
        return this.#avatar?.toJson();
    }
    hasValidAvatar() {
        const avatar = this.avatar;
        return utils.isNonEmptyString(avatar?.path) || _.isUndefined(avatar);
    }

    // parent
    parentId;
    hasValidParentId() {
        const parentId = this.parentId;
        return utils.isNonEmptyString(parentId) || _.isUndefined(parentId);
    }

    // memberSince
    memberSince;

    constructor({ userId, fullName, phone, email, passwordHash, avatar, parentId, memberSince }) {
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.avatar = avatar;
        this.parentId = parentId;
        this.memberSince = memberSince;
    }

    toJson() {
        return utils.removeUndefined({
            userId: this.userId,
            fullName: this.fullName,
            phone: this.phone,
            email: this.email,
            passwordHash: this.passwordHash,
            avatar: this.avatar,
            parentId: this.parentId,
            memberSince: this.memberSince
        });
    }
};