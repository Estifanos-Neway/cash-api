const _ = require("lodash");
const Affiliate = require("./affiliate.entity");
const utils = require("../commons/functions");

module.exports = class Transaction {

    static Reason = class {
        // transactionReasonKinds
        static #kinds = Object.freeze({
            JoiningBonus: "JoiningBonus",
            BecomeParent: "BecomeParent",
            ChildBecomeParent: "ChildBecomeParent",
            SoldProduct: "SoldProduct",
            ChildSoldProduct: "ChildSoldProduct",
            Withdrawal: "Withdrawal"
        });
        static get kinds() {
            return this.#kinds;
        }

        // #kind
        #kind;
        set kind(kind) {
            this.#kind = Transaction.Reason.kinds[kind];
        }
        get kind() {
            return this.#kind;
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

        // productId
        productId;

        constructor({ kind, affiliate = undefined, productId = undefined }) {
            this.kind = kind;
            kind = this.kind;
            if (
                kind === Transaction.Reason.kinds.BecomeParent ||
                kind === Transaction.Reason.kinds.ChildBecomeParent ||
                kind === Transaction.Reason.kinds.ChildSoldProduct
            ) {
                this.affiliate = affiliate;
            }
            if (
                kind === Transaction.Reason.kinds.SoldProduct ||
                kind === Transaction.Reason.kinds.ChildSoldProduct
            ) {
                this.productId = productId;
            }
        }

        toJson() {
            return utils.removeUndefined({
                kind: this.kind,
                affiliate: this.affiliate?.toJson(),
                productId: this.productId
            });
        }
    };

    // transactionId
    static idName = "transactionId";
    transactionId;

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

    // amount
    #amount;

    // #reason
    #reason;
    set reason(reasonJson) {
        if (_.isPlainObject(reasonJson)) {
            this.#reason = new Transaction.Reason(reasonJson);
        } else if (_.isUndefined(reasonJson)) {
            this.#reason = undefined;
        }
    }
    get reason() {
        return this.#reason;
    }
    // transactedAt
    transactedAt;

    constructor({ transactionId = undefined, affiliate, amount, reason, transactedAt = undefined }) {
        this.transactionId = transactionId;
        this.affiliate = affiliate;
        this.amount = amount;
        this.reason = reason;
        this.transactedAt = transactedAt;
    }

    toJson() {
        return utils.removeUndefined({
            transactionId: this.transactionId,
            affiliate: this.affiliate?.toJson(),
            amount: this.amount,
            reason: this.reason?.toJson(),
            transactedAt: this.transactedAt
        });
    }
};