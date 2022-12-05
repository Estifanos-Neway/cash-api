const _ = require("lodash");
const { StaticWebContents, Image } = require("../entities");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { staticWebContentsDb, filesDb } = require("../database");
const repoUtils = require("./repo.utils");

module.exports = {
    get: async ({ getManyQueries }) => {
        // @ts-ignore
        let { select } = repoUtils.validateGetManyQuery({ getManyQueries });
        const staticWebContents = await staticWebContentsDb.findOne({ select });
        return staticWebContents ? staticWebContents.toJson() : {};
    },
    updateLogoImage: async ({ imageReadStream }) => {
        const bucketName = filesDb.bucketNames.staticWebContentImages;
        const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["logoImage"] });
        const oldImagePath = oldStaticWebContents?.logoImage?.path;
        if (oldImagePath) {
            const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
            await filesDb.delete({ fileName: oldFileName, bucketName });
        }
        const fileName = `logo-${utils.createUid()}`;
        await filesDb.upload({ readStream: imageReadStream, fileName, bucketName });
        const path = `/images/${bucketName}/${fileName}`;
        const logoImage = new Image({ path }).toJson();
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ logoImage });
        const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
        return _.pick(updatedStaticWebContents, ["logoImage"]);
    },
    updateHero: async ({ heroImageReadStream, heroShortTitle, heroLongTitle, heroDescription }) => {
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ heroShortTitle, heroLongTitle, heroDescription });
        if (!staticWebContents.hasValidHeroShortTitle()) {
            throw utils.createError(rt.invalidHeroShortTitle, rc.invalidInput);
        } else if (!staticWebContents.hasValidHeroLongTitle()) {
            throw utils.createError(rt.invalidHeroLongTitle, rc.invalidInput);
        } else if (!staticWebContents.hasValidHeroDescription()) {
            throw utils.createError(rt.invalidHeroDescription, rc.invalidInput);
        } else {
            if (heroImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["heroImage"] });
                const oldImagePath = oldStaticWebContents?.heroImage?.path;
                if (oldImagePath) {
                    const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                    await filesDb.delete({ fileName: oldFileName, bucketName });
                }
                const fileName = `hero-${utils.createUid()}`;
                await filesDb.upload({ readStream: heroImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                staticWebContents.heroImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return _.pick(updatedStaticWebContents, ["heroImage", "heroShortTitle", "heroLongTitle", "heroDescription"]);
        }

    },
    updateAboutUsImage: async ({ imageReadStream }) => {
        const bucketName = filesDb.bucketNames.staticWebContentImages;
        const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["aboutUsImage"] });
        const oldImagePath = oldStaticWebContents?.aboutUsImage?.path;
        if (oldImagePath) {
            const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
            await filesDb.delete({ fileName: oldFileName, bucketName });
        }
        const fileName = `about-us-${utils.createUid()}`;
        await filesDb.upload({ readStream: imageReadStream, fileName, bucketName });
        const path = `/images/${bucketName}/${fileName}`;
        const aboutUsImage = new Image({ path }).toJson();
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ aboutUsImage });
        const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
        return _.pick(updatedStaticWebContents, ["aboutUsImage"]);
    },
    updateWhyUs: async ({ whyUsImageReadStream, whyUsTitle, whyUsDescription }) => {
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ whyUsTitle, whyUsDescription });
        if (!staticWebContents.hasValidWhyUsTitle()) {
            throw utils.createError(rt.invalidWhyUsTitle, rc.invalidInput);
        } else if (!staticWebContents.hasValidWhyUsDescription()) {
            throw utils.createError(rt.invalidWhyUsDescription, rc.invalidInput);
        } else {
            if (whyUsImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["whyUsImage"] });
                const oldImagePath = oldStaticWebContents?.whyUsImage?.path;
                if (oldImagePath) {
                    const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                    await filesDb.delete({ fileName: oldFileName, bucketName });
                }
                const fileName = `why-us-${utils.createUid()}`;
                await filesDb.upload({ readStream: whyUsImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                staticWebContents.whyUsImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return _.pick(updatedStaticWebContents, ["whyUsImage", "whyUsTitle", "whyUsDescription"]);
        }

    },
    updateWhatMakesUsUnique: async ({ whatMakesUsUniqueImageReadStream, whatMakesUsUnique }) => {
        try {
            whatMakesUsUnique = JSON.parse(whatMakesUsUnique);
        } catch (error) {
            throw utils.createError(rt.invalidWhatMakesUsUnique, rc.invalidInput);
        }
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ whatMakesUsUnique });
        if (!staticWebContents.hasValidWhatMakesUsUnique()) {
            throw utils.createError(rt.invalidWhatMakesUsUnique, rc.invalidInput);
        } else {
            if (whatMakesUsUniqueImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["whatMakesUsUnique"] });
                const oldImagePath = oldStaticWebContents?.whatMakesUsUnique?.path;
                if (oldImagePath) {
                    const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                    await filesDb.delete({ fileName: oldFileName, bucketName });
                }
                const fileName = `what-makes-us-unique-${utils.createUid()}`;
                await filesDb.upload({ readStream: whatMakesUsUniqueImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                staticWebContents.whatMakesUsUniqueImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return _.pick(updatedStaticWebContents, ["whatMakesUsUnique", "whatMakesUsUniqueImage"]);
        }
    },
    updateWhoAreWe: async ({ whoAreWeImageReadStream, whoAreWeDescription, whoAreWeVideoLink }) => {
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ whoAreWeDescription, whoAreWeVideoLink });
        if (!staticWebContents.hasValidWhoAreWeDescription()) {
            throw utils.createError(rt.invalidWhoAreWeDescription, rc.invalidInput);
        } else if (!staticWebContents.hasValidWhoAreWeVideoLink()) {
            throw utils.createError(rt.invalidWhoAreWeVideoLink, rc.invalidInput);
        } else {
            if (whoAreWeImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["whoAreWeImage"] });
                const oldImagePath = oldStaticWebContents?.whoAreWeImage?.path;
                if (oldImagePath) {
                    const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                    await filesDb.delete({ fileName: oldFileName, bucketName });
                }
                const fileName = `who-are-we-${utils.createUid()}`;
                await filesDb.upload({ readStream: whoAreWeImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                staticWebContents.whoAreWeImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return _.pick(updatedStaticWebContents, ["whoAreWeImage", "whoAreWeDescription", "whoAreWeVideoLink"]);
        }
    },
    updateHowTos: async ({ howToBuyFromUsDescription, howToAffiliateWithUsDescription, howToAffiliateWithUsVideoLink }) => {
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ howToBuyFromUsDescription, howToAffiliateWithUsDescription, howToAffiliateWithUsVideoLink });
        if (!staticWebContents.hasValidHowToBuyFromUsDescription()) {
            throw utils.createError(rt.invalidHowToBuyFromUsDescription, rc.invalidInput);
        } else if (!staticWebContents.hasValidHowToAffiliateWithUsDescription()) {
            throw utils.createError(rt.invalidHowToAffiliateWithUsDescription, rc.invalidInput);
        } else if (!staticWebContents.hasValidHowToAffiliateWithUsVideoLink()) {
            throw utils.createError(rt.invalidHowToAffiliateWithUsVideoLink, rc.invalidInput);
        } else {
            const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
            return _.pick(updatedStaticWebContents, ["howToBuyFromUsDescription", "howToAffiliateWithUsDescription", "howToAffiliateWithUsVideoLink"]);
        }

    },
    addBrand: async ({ brandLogoImageReadStream, link, rank }) => {
        const id = utils.createUid();
        // @ts-ignore
        const brand = new StaticWebContents.LogoWithLink({ id, link, rank });
        if (!brand.hasValidLink()) {
            throw utils.createError(rt.invalidBrandLink, rc.invalidInput);
        } else if (!brand.hasValidRank()) {
            throw utils.createError(rt.invalidBrandRank, rc.invalidInput);
        } else {
            if (brandLogoImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const fileName = `brand-${utils.createUid()}`;
                await filesDb.upload({ readStream: brandLogoImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                brand.logoImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.addBrand({ brand: brand.toJson() });
            return _.pick(updatedStaticWebContents.toJson(), ["brands"]);
        }
    },
    updateBrand: async ({ id, brandLogoImageReadStream, link, rank }) => {
        // @ts-ignore
        const brand = new StaticWebContents.LogoWithLink({ link, rank });
        if (!brand.hasValidLink()) {
            throw utils.createError(rt.invalidBrandLink, rc.invalidInput);
        } else if (!brand.hasValidRank()) {
            throw utils.createError(rt.invalidBrandRank, rc.invalidInput);
        } else {
            if (brandLogoImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["brands"] });
                if (oldStaticWebContents?.brands) {
                    for (const brand of oldStaticWebContents.brands) {
                        if (brand.id == id) {
                            const oldImagePath = brand.path;
                            if (oldImagePath) {
                                const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                                await filesDb.delete({ fileName: oldFileName, bucketName });
                            }
                        }
                    }
                }
                const fileName = `brand-${utils.createUid()}`;
                await filesDb.upload({ readStream: brandLogoImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                brand.logoImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.updateBrand({ id, updates: brand.toJson() });
            return _.pick(updatedStaticWebContents.toJson(), ["brands"]);
        }
    },
    deleteBrand: async ({ id }) => {
        const bucketName = filesDb.bucketNames.staticWebContentImages;
        const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["brands"] });
        if (oldStaticWebContents?.brands) {
            for (const brand of oldStaticWebContents.brands) {
                if (brand.id == id) {
                    const oldImagePath = brand.path;
                    if (oldImagePath) {
                        const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                        await filesDb.delete({ fileName: oldFileName, bucketName });
                    }
                }
            }
        }
        const updatedStaticWebContents = await staticWebContentsDb.deleteBrand({ id });
        return _.pick(updatedStaticWebContents.toJson(), ["brands"]);
    },
    addSocialLink: async ({ socialLinkLogoImageReadStream, link, rank }) => {
        const id = utils.createUid();
        // @ts-ignore
        const socialLink = new StaticWebContents.LogoWithLink({ id, link, rank });
        if (!socialLink.hasValidLink()) {
            throw utils.createError(rt.invalidSocialLinkLink, rc.invalidInput);
        } else if (!socialLink.hasValidRank()) {
            throw utils.createError(rt.invalidSocialLinkRank, rc.invalidInput);
        } else {
            if (socialLinkLogoImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const fileName = `social-link-${utils.createUid()}`;
                await filesDb.upload({ readStream: socialLinkLogoImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                socialLink.logoImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.addSocialLink({ socialLink: socialLink.toJson() });
            return _.pick(updatedStaticWebContents.toJson(), ["socialLinks"]);
        }
    },
    updateSocialLink: async ({ id, socialLinkLogoImageReadStream, link, rank }) => {
        // @ts-ignore
        const socialLink = new StaticWebContents.LogoWithLink({ link, rank });
        if (!socialLink.hasValidLink()) {
            throw utils.createError(rt.invalidSocialLinkLink, rc.invalidInput);
        } else if (!socialLink.hasValidRank()) {
            throw utils.createError(rt.invalidSocialLinkRank, rc.invalidInput);
        } else {
            if (socialLinkLogoImageReadStream) {
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["socialLinks"] });
                if (oldStaticWebContents?.socialLinks) {
                    for (const socialLink of oldStaticWebContents.socialLinks) {
                        if (socialLink.id == id) {
                            const oldImagePath = socialLink.path;
                            if (oldImagePath) {
                                const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                                await filesDb.delete({ fileName: oldFileName, bucketName });
                            }
                        }
                    }
                }
                const fileName = `social-link-${utils.createUid()}`;
                await filesDb.upload({ readStream: socialLinkLogoImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                socialLink.logoImage = new Image({ path }).toJson();
            }
            const updatedStaticWebContents = await staticWebContentsDb.updateSocialLink({ id, updates: socialLink.toJson() });
            return _.pick(updatedStaticWebContents.toJson(), ["socialLinks"]);
        }
    },
    deleteSocialLink: async ({ id }) => {
        const bucketName = filesDb.bucketNames.staticWebContentImages;
        const oldStaticWebContents = await staticWebContentsDb.findOne({ select: ["socialLinks"] });
        if (oldStaticWebContents?.socialLinks) {
            for (const socialLink of oldStaticWebContents.socialLinks) {
                if (socialLink.id == id) {
                    const oldImagePath = socialLink.path;
                    if (oldImagePath) {
                        const oldFileName = oldImagePath.substring(oldImagePath.lastIndexOf("/") + 1);
                        await filesDb.delete({ fileName: oldFileName, bucketName });
                    }
                }
            }
        }
        const updatedStaticWebContents = await staticWebContentsDb.deleteSocialLink({ id });
        return _.pick(updatedStaticWebContents.toJson(), ["socialLinks"]);
    }
};