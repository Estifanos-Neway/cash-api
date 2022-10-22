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

    constructor({ deletedAffiliateId, affiliate, deletedAt }) {
        this.deletedAffiliateId = deletedAffiliateId;
        this.affiliate = affiliate;
        this.deletedAt = deletedAt;
    }
};