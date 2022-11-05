const _ = require("lodash");
const utils = require("../commons/functions");


module.exports = class Analytics {
    // Statics
    static Counts = class {
        totalProducts;
        totalOrders;
        acceptedOrders;
        totalAffiliates;
        totalEarned;
        totalUnpaid;

        constructor({ totalProducts, totalOrders, acceptedOrders, totalAffiliates, totalEarned, totalUnpaid }) {
            this.totalProducts = totalProducts;
            this.totalOrders = totalOrders;
            this.acceptedOrders = acceptedOrders;
            this.totalAffiliates = totalAffiliates;
            this.totalEarned = totalEarned;
            this.totalUnpaid = totalUnpaid;
        }
        toJson() {
            return utils.removeUndefined({
                totalProducts: this.totalProducts,
                totalOrders: this.totalOrders,
                acceptedOrders: this.acceptedOrders,
                totalAffiliates: this.totalAffiliates,
                totalEarned: this.totalEarned,
                totalUnpaid: this.totalUnpaid
            });
        }
    };
    // counts
    #counts;
    set counts(countsJson) {
        if (_.isPlainObject(countsJson)) {
            this.#counts = new Analytics.Counts(countsJson);
        } else if (_.isUndefined(countsJson)) {
            this.#counts = undefined;
        }
    }
    get counts() {
        return this.#counts;
    }

    constructor({ counts }) {
        this.counts = counts;
    }

    toJson() {
        return utils.removeUndefined({
            counts: this.counts?.toJson()
        });
    }

};