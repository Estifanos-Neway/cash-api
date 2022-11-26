const _ = require("lodash");
const utils = require("../commons/functions");
const Image = require("./image.entity");
const User = require("./user.entity");

module.exports = class Affiliate {
    static idName = "userId";

    // #userId
    #userId;
    set userId(userId) {
        this.#userId = utils.trim(userId);
    }
    get userId() {
        return this.#userId;
    }
    hasValidUserId(strict) {
        return utils.isValidDbId(this.userId) || (!strict && _.isUndefined(this.userId));
    }
    // #fullName
    #fullName;
    set fullName(fullName) {
        this.#fullName = utils.trim(fullName);
    }
    get fullName() {
        return this.#fullName;
    }
    hasValidFullName(strict) {
        const fullName = this.fullName;
        return utils.isNonEmptyString(fullName) || (!strict && _.isUndefined(fullName));
    }

    // phone
    #phone;
    set phone(phone) {
        phone = utils.trim(phone);
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
    #email;
    set email(email) {
        email = utils.trim(email);
        if (_.isString(email)) {
            email = email.toLowerCase();
        }
        this.#email = email;
    }
    get email() {
        return this.#email;
    }
    hasValidEmail(strict) {
        const email = this.email;
        return utils.isEmail(email) || (!strict && _.isUndefined(email));
    }

    // #passwordHash
    #passwordHash;
    set passwordHash(passwordHash) {
        this.#passwordHash = utils.trim(passwordHash);
    }
    get passwordHash() {
        return this.#passwordHash;
    }
    hasValidPasswordHash(strict) {
        const passwordHash = this.passwordHash;
        return utils.isNonEmptyString(passwordHash) || (!strict && _.isUndefined(passwordHash));
    }

    // #avatar
    #avatar;
    set avatar(imageJson) {
        this.#avatar = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get avatar() {
        return this.#avatar?.toJson();
    }

    // #parent
    #parentId;
    set parentId(parentId) {
        this.#parentId = utils.trim(parentId);
    }
    get parentId() {
        return this.#parentId;
    }
    hasValidParentId() {
        const parentId = this.parentId;
        return User.isValidUserId(parentId) || _.isUndefined(parentId);
    }

    // childrenCount
    childrenCount;

    // wallet
    wallet;

    // affiliationSummary
    affiliationSummary;

    // memberSince
    memberSince;

    constructor({ userId, fullName, phone, email, passwordHash, avatar, parentId, childrenCount, wallet, affiliationSummary, memberSince }) {
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.avatar = avatar;
        this.parentId = parentId;
        this.childrenCount = childrenCount;
        this.wallet = wallet;
        this.affiliationSummary = affiliationSummary;
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
            childrenCount: this.childrenCount,
            wallet: this.wallet,
            affiliationSummary: this.affiliationSummary,
            memberSince: this.memberSince
        });
    }
};