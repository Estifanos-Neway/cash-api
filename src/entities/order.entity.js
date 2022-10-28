const _ = require("lodash");
const Product = require("./product.entity");
const utils = require("../commons/functions");
const Affiliate = require("./affiliate.entity");

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
        } else if (_.isUndefined(productJson)) {
            this.#product = undefined;
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
        } else if (_.isUndefined(orderedByJson)) {
            this.#orderedBy = undefined;
        }
    }
    get orderedBy() {
        return this.#orderedBy;
    }

    // affiliate;
    #affiliate;
    set affiliate(affiliateJson) {
        if (_.isPlainObject(affiliateJson)) {
            this.#affiliate = new Affiliate(affiliateJson);
        } else if (_.isUndefined(affiliateJson)) {
            this.#affiliate = undefined;
        }
    }
    get affiliate() {
        return this.#affiliate;
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

    constructor({ orderId, product, orderedBy, affiliate, orderedAt, status }) {
        this.orderId = orderId;
        this.product = product;
        this.orderedBy = orderedBy;
        this.affiliate = affiliate;
        this.orderedAt = orderedAt;
        this.status = status;
    }

    toJson() {
        return utils.removeUndefined({
            orderId: this.orderId,
            product: this.product?.toJson(),
            orderedBy: this.orderedBy?.toJson(),
            affiliate: this.affiliate?.toJson(),
            orderedAt: this.orderedAt,
            status: this.status
        });
    }
    static isValidOrderId(userId) {
        return utils.isValidDbId(userId);
    }
};