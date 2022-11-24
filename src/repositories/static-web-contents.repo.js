const { StaticWebContents, Image } = require("../entities");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { staticWebContentsDb, filesDb } = require("../database");
const repoUtils = require("./repo.utils");

module.exports = {
    updateLogoImage: async ({ imageReadStream }) => {
        const fileName = "logo-image";
        const bucketName = filesDb.bucketNames.staticWebContentImages;
        await filesDb.delete({ fileName, bucketName });
        await filesDb.upload({ readStream: imageReadStream, fileName, bucketName });
        const path = `/images/${bucketName}/${fileName}`;
        const logoImage = new Image({ path }).toJson();
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ logoImage });
        const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
        return { logoImage: updatedStaticWebContents.logoImage };
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
                const fileName = "hero-image";
                const bucketName = filesDb.bucketNames.staticWebContentImages;
                await filesDb.delete({ fileName, bucketName });
                await filesDb.upload({ readStream: heroImageReadStream, fileName, bucketName });
                const path = `/images/${bucketName}/${fileName}`;
                const logoImage = new Image({ path }).toJson();
            }
        }

        const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
        return { logoImage: updatedStaticWebContents.logoImage };
    },
    updateWhatMakesUsUnique: async ({ whatMakesUsUnique }) => {
        // @ts-ignore
        const staticWebContents = new StaticWebContents({ whatMakesUsUnique });
        if (!staticWebContents.hasValidWhatMakesUsUnique()) {
            throw utils.createError(rt.invalidWhatMakesUsUnique, rc.invalidInput);
        }
        const updatedStaticWebContents = await staticWebContentsDb.update(staticWebContents.toJson());
        return updatedStaticWebContents.toJson();
    },
    get: async ({ getManyQueries }) => {
        // @ts-ignore
        let { select } = repoUtils.validateGetManyQuery({ getManyQueries });
        const staticWebContents = await staticWebContentsDb.findOne({ select });
        return staticWebContents ? staticWebContents.toJson() : {};
    }
};