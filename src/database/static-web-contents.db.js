const { db } = require("./db.commons");
const { staticWebContentsDbModel } = require("./db-models");
const { StaticWebContents } = require("../entities");

function adaptEntity(dbDoc) {
    dbDoc = dbDoc.toJSON();
    if (dbDoc.brands) {
        dbDoc.brands.sort((brand1, brand2) => {
            return brand1.rank < brand2.rank ? 1 : -1;
        });
    }
    if (dbDoc.socialLinks) {
        dbDoc.socialLinks.sort((socialLink1, socialLink2) => {
            return socialLink1.rank < socialLink2.rank ? 1 : -1;
        });
    }
    return new StaticWebContents(dbDoc);
}
module.exports = Object.freeze({
    update: async (updates) => {
        const updateOptions = { upsert: true };
        const updatedStaticWebContentsDoc = await db.updateOne(staticWebContentsDbModel, {}, updates, updateOptions);
        return adaptEntity(updatedStaticWebContentsDoc);
    },
    findOne: async ({ select }) => {
        const staticWebContentsDoc = await db.findOne(staticWebContentsDbModel, undefined, select);
        return staticWebContentsDoc ? adaptEntity(staticWebContentsDoc) : null;
    },
    addBrand: async ({ brand }) => {
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        staticWebContentsDoc.brands.push(brand);
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    },
    updateBrand: async ({ id, updates }) => {
        delete updates.id;
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        for (let brand of staticWebContentsDoc.brands) {
            if (brand.id === id) {
                for (const [key, value] of Object.entries(updates)) {
                    brand[key] = value;
                }
                break;
            }
        }
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    },
    deleteBrand: async ({ id }) => {
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        staticWebContentsDoc.brands = staticWebContentsDoc.brands.filter(brand => brand.id != id);
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    },
    addSocialLink: async ({ socialLink }) => {
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        staticWebContentsDoc.socialLinks.push(socialLink);
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    },
    updateSocialLink: async ({ id, updates }) => {
        delete updates.id;
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        for (let socialLink of staticWebContentsDoc.socialLinks) {
            if (socialLink.id === id) {
                for (const [key, value] of Object.entries(updates)) {
                    socialLink[key] = value;
                }
                break;
            }
        }
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    },
    deleteSocialLink: async ({ id }) => {
        let staticWebContentsDoc = await db.findOne(staticWebContentsDbModel);
        staticWebContentsDoc.socialLinks = staticWebContentsDoc.socialLinks.filter(socialLink => socialLink.id != id);
        staticWebContentsDoc = await staticWebContentsDoc.save();
        return adaptEntity(staticWebContentsDoc);
    }
});