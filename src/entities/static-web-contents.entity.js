const _ = require("lodash");
const { isNonEmptyString } = require("../commons/functions");
const utils = require("../commons/functions");
const Image = require("./image.entity");

// class videoLinks {
//     // #whoAreWe
//     #whoAreWe;
//     set whoAreWe(whoAreWe) {
//         this.#whoAreWe = utils.trim(whoAreWe);
//     }
//     get whoAreWe() {
//         return this.#whoAreWe;
//     }
//     hasValidWhoAreWe() {
//         return utils.isNonEmptyString(this.whoAreWe) || _.isUndefined(this.whoAreWe) || _.isNull(this.whoAreWe);
//     }

//     // #howToAffiliateWithUs
//     #howToAffiliateWithUs;
//     set howToAffiliateWithUs(howToAffiliateWithUs) {
//         this.#howToAffiliateWithUs = utils.trim(howToAffiliateWithUs);
//     }
//     get howToAffiliateWithUs() {
//         return this.#howToAffiliateWithUs;
//     }
//     hasValidHowToAffiliateWithUs() {
//         return utils.isNonEmptyString(this.howToAffiliateWithUs) || _.isUndefined(this.howToAffiliateWithUs) || _.isNull(this.howToAffiliateWithUs);
//     }

//     constructor({ whoAreWe, howToAffiliateWithUs }) {
//         this.whoAreWe = whoAreWe;
//         this.howToAffiliateWithUs = howToAffiliateWithUs;
//     }

//     toJson() {
//         return utils.removeUndefined({
//             whoAreWe: this.whoAreWe,
//             howToAffiliateWithUs: this.howToAffiliateWithUs
//         });
//     }
// }
module.exports = class StaticWebContents {
    // #logoImage;
    #logoImage;
    set logoImage(imageJson) {
        this.#logoImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get logoImage() {
        return this.#logoImage?.toJson();
    }

    // #heroImage
    #heroImage;
    set heroImage(imageJson) {
        this.#heroImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get heroImage() {
        return this.#heroImage?.toJson();
    }

    // heroShortTitle
    heroShortTitle;
    hasValidHeroShortTitle() {
        return isNonEmptyString(this.heroShortTitle);
    }

    // heroLongTitle
    heroLongTitle;
    hasValidHeroLongTitle() {
        return isNonEmptyString(this.heroLongTitle);
    }

    // heroDescription
    heroDescription;
    hasValidHeroDescription() {
        return isNonEmptyString(this.heroDescription);
    }

    // #aboutUsImage
    #aboutUsImage;
    set aboutUsImage(imageJson) {
        this.#aboutUsImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get aboutUsImage() {
        return this.#aboutUsImage?.toJson();
    }

    // #whyUsImage
    #whyUsImage;
    set whyUsImage(imageJson) {
        this.#whyUsImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get whyUsImage() {
        return this.#whyUsImage?.toJson();
    }

    // whyUsTitle
    whyUsTitle;
    hasValidWhyUsTitle() {
        return isNonEmptyString(this.whyUsTitle);
    }

    // whyUsDescription
    whyUsDescription;
    hasValidWhyUsDescription() {
        return isNonEmptyString(this.whyUsDescription);
    }

    // whatMakesUsUnique
    whatMakesUsUnique;
    hasValidWhatMakesUsUnique() {
        if (!_.isArray(this.whatMakesUsUnique)) {
            return false;
        } else {
            for (let value of this.whatMakesUsUnique) {
                if (!isNonEmptyString(value)) {
                    return false;
                }
            }
            return true;
        }
    }

    // #whoAreWeImage
    #whoAreWeImage;
    set whoAreWeImage(imageJson) {
        this.#whoAreWeImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
    }
    get whoAreWeImage() {
        return this.#whoAreWeImage?.toJson();
    }
    // whoAreWeDescription
    whoAreWeDescription;
    hasValidWhoAreWeDescription() {
        return isNonEmptyString(this.whoAreWeDescription);
    }

    // whoAreWeVideoLink
    whoAreWeVideoLink;
    hasValidWhoAreWeVideoLink() {
        return isNonEmptyString(this.whoAreWeVideoLink);
    }

    // howToBuyFromUsDescription
    howToBuyFromUsDescription;
    hasValidHowToBuyFromUsDescription() {
        return isNonEmptyString(this.howToBuyFromUsDescription);
    }

    // howToAffiliateWithUsDescription
    howToAffiliateWithUsDescription;
    hasValidHowToAffiliateWithUsDescription() {
        return isNonEmptyString(this.howToAffiliateWithUsDescription);
    }

    // howToAffiliateWithUsVideoLink
    howToAffiliateWithUsVideoLink;
    hasValidHowToAffiliateWithUsVideoLink() {
        return isNonEmptyString(this.howToAffiliateWithUsVideoLink);
    }

    constructor({
        logoImage,
        heroImage,
        heroShortTitle,
        heroLongTitle,
        heroDescription,
        aboutUsImage,
        whyUsImage,
        whyUsTitle,
        whyUsDescription,
        whatMakesUsUnique,
        whoAreWeImage,
        whoAreWeDescription,
        whoAreWeVideoLink,
        howToBuyFromUsDescription,
        howToAffiliateWithUsDescription,
        howToAffiliateWithUsVideoLink
    }) {
        this.logoImage = logoImage;
        this.heroImage = heroImage;
        this.heroShortTitle = heroShortTitle;
        this.heroLongTitle = heroLongTitle;
        this.heroDescription = heroDescription;
        this.aboutUsImage = aboutUsImage;
        this.whyUsImage = whyUsImage;
        this.whyUsTitle = whyUsTitle;
        this.whyUsDescription = whyUsDescription;
        this.whatMakesUsUnique = whatMakesUsUnique;
        this.whoAreWeImage = whoAreWeImage;
        this.whoAreWeDescription = whoAreWeDescription;
        this.whoAreWeVideoLink = whoAreWeVideoLink;
        this.howToBuyFromUsDescription = howToBuyFromUsDescription;
        this.howToAffiliateWithUsDescription = howToAffiliateWithUsDescription;
        this.howToAffiliateWithUsVideoLink = howToAffiliateWithUsVideoLink;
    }

    toJson() {
        return utils.removeUndefined({
            logoImage: this.logoImage,
            heroImage: this.heroImage,
            heroShortTitle: this.heroShortTitle,
            heroLongTitle: this.heroLongTitle,
            heroDescription: this.heroDescription,
            aboutUsImage: this.aboutUsImage,
            whyUsImage: this.whyUsImage,
            whyUsTitle: this.whyUsTitle,
            whyUsDescription: this.whyUsDescription,
            whatMakesUsUnique: this.whatMakesUsUnique,
            whoAreWeImage: this.whoAreWeImage,
            whoAreWeDescription: this.whoAreWeDescription,
            whoAreWeVideoLink: this.whoAreWeVideoLink,
            howToBuyFromUsDescription: this.howToBuyFromUsDescription,
            howToAffiliateWithUsDescription: this.howToAffiliateWithUsDescription,
            howToAffiliateWithUsVideoLink: this.howToAffiliateWithUsVideoLink
        });
    }
};