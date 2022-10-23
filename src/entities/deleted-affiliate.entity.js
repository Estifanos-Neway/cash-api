const utils = require("../commons/functions");
const Affiliate = require("./affiliate.entity");

module.exports = class DeletedAffiliate {
    // deletedAffiliateId
    deletedAffiliateId;

    // #affiliate
    #affiliate;
    set affiliate(affiliateJson) {
        this.#affiliate = new Affiliate(affiliateJson);
    }
    get affiliate() {
        return this.#affiliate?.toJson();
    }

    // #deletedAt
    deletedAt;

    constructor({ deletedAffiliateId, affiliateJson, deletedAt }) {
        this.deletedAffiliateId = deletedAffiliateId;
        this.affiliate = affiliateJson;
        this.deletedAt = deletedAt;
    }

    toJson() {
        return utils.removeUndefined({
            deletedAffiliateId: this.deletedAffiliateId,
            affiliate: this.affiliate,
            deletedAt: this.deletedAt
        });
    }
};