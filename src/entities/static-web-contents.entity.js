const _ = require("lodash");
const { isNonEmptyString } = require("../commons/functions");
const utils = require("../commons/functions");
const Image = require("./image.entity");

module.exports = class StaticWebContents {
    static LogoWithLink = class {
        // id
        id;

        // #logo
        #logoImage;
        set logoImage(imageJson) {
            this.#logoImage = _.isPlainObject(imageJson) ? new Image(imageJson) : undefined;
        }
        get logoImage() {
            return this.#logoImage;
        }

        // link
        link;
        hasValidLink() {
            return isNonEmptyString(this.link);
        }

        // #rank
        #rank;
        set rank(value) {
            value = Number.parseInt(value?.toString());
            this.#rank = utils.isNumber(value) ? value : undefined;
        }
        get rank() {
            return this.#rank;
        }
        hasValidRank() {
            return utils.isNumber(this.rank) || _.isUndefined(this.rank);
        }

        constructor({ id, logoImage, link, rank }) {
            this.id = id;
            this.logoImage = logoImage;
            this.link = link;
            this.rank = rank;
        }

        toJson() {
            return utils.removeUndefined({
                id: this.id,
                logoImage: this.logoImage?.toJson(),
                link: this.link,
                rank: this.rank
            });
        }
    };

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

    // #brands;
    #brands;
    set brands(logoWithLinkJsonArray) {
        if (!_.isArray(logoWithLinkJsonArray)) {
            this.#brands = undefined;
        } else {
            this.#brands = [];
            for (let logoWithLinkJson of logoWithLinkJsonArray) {
                if (_.isPlainObject(logoWithLinkJson)) {
                    this.#brands.push(new StaticWebContents.LogoWithLink(logoWithLinkJson));
                }
            }
        }
    }
    get brands() {
        return this.#brands;
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
        howToAffiliateWithUsVideoLink,
        brands
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
        this.brands = brands;
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
            howToAffiliateWithUsVideoLink: this.howToAffiliateWithUsVideoLink,
            brands: this.brands?.map(logoWithLinkObject => logoWithLinkObject.toJson())
        });
    }
};