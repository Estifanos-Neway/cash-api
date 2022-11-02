const _ = require("lodash");
const utils = require("../commons/functions");

class videoLinks {
    whoAreWe;
    hasValidWhoAreWe() {
        return utils.isNonEmptyString(this.whoAreWe) || _.isUndefined(this.whoAreWe);
    }

    howToAffiliateWithUs;
    hasValidHowToAffiliateWithUs() {
        return utils.isNonEmptyString(this.howToAffiliateWithUs) || _.isUndefined(this.howToAffiliateWithUs);
    }

    constructor({ whoAreWe, howToAffiliateWithUs }) {
        this.whoAreWe = whoAreWe;
        this.howToAffiliateWithUs = howToAffiliateWithUs;
    }

    toJson() {
        return utils.removeUndefined({
            whoAreWe: this.whoAreWe,
            howToAffiliateWithUs: this.howToAffiliateWithUs
        });
    }
}
module.exports = class StaticWebContents {
    #videoLinks;
    set videoLinks(videoLinksJson) {
        if (_.isPlainObject(videoLinksJson)) {
            this.#videoLinks = new videoLinks(videoLinksJson);
        } else if (_.isUndefined(videoLinksJson)) {
            this.#videoLinks = undefined;
        }
    }
    get videoLinks() {
        return this.#videoLinks;
    }

    constructor({ videoLinks }) {
        this.videoLinks = videoLinks;
    }

    toJson() {
        return utils.removeUndefined({
            videoLinks: this.videoLinks?.toJson()
        });
    }
};