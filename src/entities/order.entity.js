const _ = require("lodash");
const Product = require("./product.entity");
const User = require("./user.entity");
const utils = require("../commons/functions");

class OrderedBy {
    // fullName
    fullName;
    hasValidFullName(strict) {
        return utils.isNonEmptyString(this.fullName) || (!strict && _.isUndefined(this.fullName));
    }

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
        return !!utils.isPhone(this.phone) || (!strict && _.isUndefined(this.phone));
    }

    // companyName
    companyName;
    hasValidCompanyName() {
        return utils.isNonEmptyString(this.companyName) || _.isUndefined(this.companyName);
    }

    constructor({ fullName, phone, companyName }) {
        this.fullName = fullName;
        this.phone = phone;
        this.companyName = companyName;
    }

    toJson() {
        return utils.removeUndefined({
            fullName: this.fullName,
            phone: this.phone,
            companyName: this.companyName
        });
    }
}
module.exports = class Order {
    static #statuses = Object.freeze({
        Pending: "Pending",
        Accepted: "Accepted",
        Rejected: "Rejected"
    });
    static get statuses() {
        return Order.#statuses;
    }

    static idName = "orderId";
    // orderId
    orderId;

    // #product;
    #product;
    set product(productJson) {
        if (_.isPlainObject(productJson)) {
            this.#product = new Product(productJson);
        }
    }
    get product() {
        return this.#product;
    }

    // #orderedBy;
    #orderedBy;
    set orderedBy(orderedByJson) {
        if (_.isPlainObject(orderedByJson)) {
            this.#orderedBy = new OrderedBy(orderedByJson);
        }
    }
    get orderedBy() {
        return this.#orderedBy;
    }

    // affiliateId;
    affiliateId;
    hasValidAffiliateId() {
        return User.isValidUserId(this.affiliateId) || _.isUndefined(this.affiliateId);
    }

    // orderedAt;
    orderedAt;

    // status;
    #status;
    set status(status) {
        this.#status = Order.#statuses[status];
    }
    get status() {
        return this.#status;
    }

    constructor({ orderId, product, orderedBy, affiliateId, orderedAt, status }) {
        this.orderId = orderId;
        this.product = product;
        this.orderedBy = orderedBy;
        this.affiliateId = affiliateId;
        this.orderedAt = orderedAt;
        this.status = status;
    }

    toJson() {
        return utils.removeUndefined({
            orderId: this.orderId,
            product: this.product?.toJson(),
            orderedBy: this.orderedBy?.toJson(),
            affiliateId: this.affiliateId,
            orderedAt: this.orderedAt,
            status: this.status
        });
    }
};