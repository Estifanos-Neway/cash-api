const path = require("path");
const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../configs");
const utils = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const testUtils = require("./test.utils");

describe("/static-web-contents", () => {
    testUtils.setJestTimeout();
    jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
    const mainPath = "/static-web-contents";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: utils.hash(defaultAdmin.password)
    };
    let staticWebContents = {};
    const hero = {
        heroShortTitle: "heroShortTitle",
        heroLongTitle: "heroLongTitle",
        heroDescription: "heroDescription"
    };
    const whyUs = {
        whyUsTitle: "whyUsTitle",
        whyUsDescription: "whyUsDescription"
    };
    const whatMakesUsUnique = {
        whatMakesUsUnique: ["whatMakesUsUnique1", "whatMakesUsUnique2"]
    };
    const whoAreWe = {
        whoAreWeDescription: "whoAreWeDescription",
        whoAreWeVideoLink: "whoAreWeVideoLink"
    };
    const howTos = {
        howToBuyFromUsDescription: "howToBuyFromUsDescription",
        howToAffiliateWithUsDescription: "howToAffiliateWithUsDescription",
        howToAffiliateWithUsVideoLink: "howToAffiliateWithUsVideoLink"
    };
    const brand1 = {
        link: "brand1.link",
        rank: -1
    };
    const brand2 = {
        link: "brand2.link",
        rank: 1
    };
    const defaultBrand = {
        rank: 0
    };
    const socialLink1 = {
        link: "socialLink1.link",
        rank: -1
    };
    const socialLink2 = {
        link: "socialLink2.link",
        rank: 1
    };
    const defaultSocialLink = {
        rank: 0
    };
    let req, accessToken;
    const expectString = expect.any(String);
    const expectImage = { path: expectString };
    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
        await adminsRepo.signUp({ ...adminCredentials });
        req = supertest(makeApp());
        // @ts-ignore
        const { body } = await req.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send({ ...adminCredentials });
        accessToken = body.accessToken;
    });

    beforeEach(async () => {
        req = supertest(makeApp());
    });

    afterAll(async () => {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
    });

    describe("/", () => {
        describe("GET", () => {
            describe("Given there are no static web contents in the system", () => {
                it("Should return empty object", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(staticWebContents);
                });
            });
        });
        describe("/logo-image", () => {
            const subPath = `${mainPath}/logo-image`;
            describe("PUT", () => {
                describe("Given valid image file", () => {
                    it("Should return staticWebContents object and valid image link", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ logoImage: expectImage });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given non-image file format", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given no image", () => {
                    it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                    });
                });

            });
        });
        describe("/hero", () => {
            const subPath = `${mainPath}/hero`;
            describe("PUT", () => {
                describe("Given all fields", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("heroImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("heroShortTitle", hero.heroShortTitle)
                            .field("heroLongTitle", hero.heroLongTitle)
                            .field("heroDescription", hero.heroDescription);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ heroImage: expectImage, ...hero });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.heroImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given all fields but heroImage", () => {
                    it("Should return the updated object", async () => {
                        const heroShortTitle2 = "heroShortTitle2";
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("heroShortTitle", heroShortTitle2)
                            .field("heroLongTitle", hero.heroLongTitle)
                            .field("heroDescription", hero.heroDescription);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ heroImage: expectImage, ...hero, heroShortTitle: heroShortTitle2 });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-image file format for heroImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("heroImage", path.resolve("src", "assets", "files", "sample-file.txt"))
                            .field("heroShortTitle", hero.heroShortTitle)
                            .field("heroLongTitle", hero.heroLongTitle)
                            .field("heroDescription", hero.heroDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given all required fields but heroShortTitle", () => {
                    it(`Should return 400 and ${rt.invalidHeroShortTitle}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("heroLongTitle", hero.heroLongTitle)
                            .field("heroDescription", hero.heroDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHeroShortTitle));
                    });
                });
                describe("Given all required fields but heroLongTitle", () => {
                    it(`Should return 400 and ${rt.invalidHeroLongTitle}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("heroShortTitle", hero.heroShortTitle)
                            .field("heroDescription", hero.heroDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHeroLongTitle));
                    });
                });
                describe("Given all required fields but heroDescription", () => {
                    it(`Should return 400 and ${rt.invalidHeroDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("heroShortTitle", hero.heroShortTitle)
                            .field("heroLongTitle", hero.heroLongTitle);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHeroDescription));
                    });
                });
            });
        });
        describe("/about-us-image", () => {
            const subPath = `${mainPath}/about-us-image`;
            describe("PUT", () => {
                describe("Given valid image file", () => {
                    it("Should return staticWebContents object and valid image link", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("aboutUsImage", path.resolve("src", "assets", "images", "sample-image-1.png"));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ aboutUsImage: expectImage });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.aboutUsImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given non-image file format", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("aboutUsImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given no image", () => {
                    it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                    });
                });

            });
        });
        describe("/why-us", () => {
            const subPath = `${mainPath}/why-us`;
            describe("PUT", () => {
                describe("Given all fields", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whyUsImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("whyUsTitle", whyUs.whyUsTitle)
                            .field("whyUsDescription", whyUs.whyUsDescription);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whyUsImage: expectImage, ...whyUs });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.whyUsImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given all fields but whyUsImage", () => {
                    it("Should return the updated object", async () => {
                        const whyUsTitle2 = "whyUsTitle2";
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whyUsTitle", whyUsTitle2)
                            .field("whyUsDescription", whyUs.whyUsDescription);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whyUsImage: expectImage, ...whyUs, whyUsTitle: whyUsTitle2 });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-image file format for whyUsImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whyUsImage", path.resolve("src", "assets", "files", "sample-file.txt"))
                            .field("whyUsTitle", whyUs.whyUsTitle)
                            .field("whyUsDescription", whyUs.whyUsDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given all required fields but whyUsTitle", () => {
                    it(`Should return 400 and ${rt.invalidWhyUsTitle}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whyUsDescription", whyUs.whyUsDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhyUsTitle));
                    });
                });
                describe("Given all required fields but whyUsDescription", () => {
                    it(`Should return 400 and ${rt.invalidWhyUsDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whyUsTitle", whyUs.whyUsTitle);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhyUsDescription));
                    });
                });
            });
        });
        describe("/what-makes-us-unique", () => {
            const subPath = `${mainPath}/what-makes-us-unique`;
            describe("PUT", () => {
                describe("Given valid whatMakesUsUnique", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whatMakesUsUniqueImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("whatMakesUsUnique", JSON.stringify(whatMakesUsUnique.whatMakesUsUnique));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whatMakesUsUniqueImage: expectImage, ...whatMakesUsUnique });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.whatMakesUsUniqueImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given all fields but whatMakesUsUniqueImage", () => {
                    it("Should return staticWebContents object", async () => {
                        whatMakesUsUnique.whatMakesUsUnique.push("whatMakesUsUnique3");
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whatMakesUsUnique", JSON.stringify(whatMakesUsUnique.whatMakesUsUnique));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whatMakesUsUniqueImage: expectImage, ...whatMakesUsUnique });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-image file format for whatMakesUsUniqueImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whatMakesUsUniqueImage", path.resolve("src", "assets", "files", "sample-file.txt"))
                            .field("whatMakesUsUnique", JSON.stringify(whatMakesUsUnique.whatMakesUsUnique));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given non-array (invalid) whatMakesUsUnique", () => {
                    it(`Should return 400 and ${rt.invalidWhatMakesUsUnique}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ whatMakesUsUnique: "invalid" });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhatMakesUsUnique));
                    });
                });
                describe("Given no whatMakesUsUnique", () => {
                    it(`Should return 400 and ${rt.invalidWhatMakesUsUnique}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhatMakesUsUnique));
                    });
                });
            });
        });
        describe("/who-are-we", () => {
            const subPath = `${mainPath}/who-are-we`;
            describe("PUT", () => {
                describe("Given all fields", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whoAreWeImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("whoAreWeDescription", whoAreWe.whoAreWeDescription)
                            .field("whoAreWeVideoLink", whoAreWe.whoAreWeVideoLink);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whoAreWeImage: expectImage, ...whoAreWe });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.whoAreWeImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given all fields but whoAreWeImage", () => {
                    it("Should return the updated object", async () => {
                        const whoAreWeDescription2 = "whoAreWeDescription2";
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whoAreWeDescription", whoAreWeDescription2)
                            .field("whoAreWeVideoLink", whoAreWe.whoAreWeVideoLink);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ whoAreWeImage: expectImage, ...whoAreWe, whoAreWeDescription: whoAreWeDescription2 });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-image file format for whoAreWeImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("whoAreWeImage", path.resolve("src", "assets", "files", "sample-file.txt"))
                            .field("whoAreWeDescription", whoAreWe.whoAreWeDescription)
                            .field("whoAreWeVideoLink", whoAreWe.whoAreWeVideoLink);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given all required fields but whoAreWeDescription", () => {
                    it(`Should return 400 and ${rt.invalidWhoAreWeDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whoAreWeVideoLink", whoAreWe.whoAreWeVideoLink);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhoAreWeDescription));
                    });
                });
                describe("Given all required fields but whoAreWeVideoLink", () => {
                    it(`Should return 400 and ${rt.invalidWhoAreWeVideoLink}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("whoAreWeDescription", whoAreWe.whoAreWeDescription);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidWhoAreWeVideoLink));
                    });
                });
            });
        });
        describe("/how-tos", () => {
            const subPath = `${mainPath}/how-tos`;
            describe("PUT", () => {
                describe("Given valid fields", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send(howTos);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual(howTos);
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given invalid howToBuyFromUsDescription", () => {
                    it(`Should return 400 and ${rt.invalidHowToBuyFromUsDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToBuyFromUsDescription: ["invalid"] });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToBuyFromUsDescription));
                    });
                });
                describe("Given no howToBuyFromUsDescription", () => {
                    it(`Should return 400 and ${rt.invalidHowToBuyFromUsDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToBuyFromUsDescription: undefined });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToBuyFromUsDescription));
                    });
                });
                describe("Given invalid howToAffiliateWithUsDescription", () => {
                    it(`Should return 400 and ${rt.invalidHowToAffiliateWithUsDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToAffiliateWithUsDescription: ["invalid"] });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToAffiliateWithUsDescription));
                    });
                });
                describe("Given no howToAffiliateWithUsDescription", () => {
                    it(`Should return 400 and ${rt.invalidHowToAffiliateWithUsDescription}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToAffiliateWithUsDescription: undefined });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToAffiliateWithUsDescription));
                    });
                });
                describe("Given invalid howToAffiliateWithUsVideoLink", () => {
                    it(`Should return 400 and ${rt.invalidHowToAffiliateWithUsVideoLink}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToAffiliateWithUsVideoLink: ["invalid"] });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToAffiliateWithUsVideoLink));
                    });
                });
                describe("Given no howToAffiliateWithUsVideoLink", () => {
                    it(`Should return 400 and ${rt.invalidHowToAffiliateWithUsVideoLink}`, async () => {
                        const { body, statusCode } = await req.put(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .send({ ...howTos, howToAffiliateWithUsVideoLink: undefined });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidHowToAffiliateWithUsVideoLink));
                    });
                });
            });
        });
        describe("/brands", () => {
            const subPath = `${mainPath}/brands`;
            describe("POST", () => {
                describe("Given valid brand data [1]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", brand1.link)
                            .field("rank", brand1.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [{ ...brand1, id: expectString, logoImage: expectImage }] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.brands[0].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given valid brand data [2]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", brand2.link)
                            .field("rank", brand2.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [{ ...brand2, id: expectString, logoImage: expectImage }, staticWebContents.brands[0]] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.brands[0].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given only the logoImage field [3]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [staticWebContents.brands[0], { ...defaultBrand, id: expectString, logoImage: expectImage }, staticWebContents.brands[1]] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.brands[1].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given non-image file format for logoImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given no logoImage", () => {
                    it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                    });
                });
            });
        });
        describe("/brands/{id}", () => {
            const subPath = `${mainPath}/brands`;
            describe("PATCH", () => {
                describe("Given valid brand id and data", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const updatedBrand = {
                            ...staticWebContents.brands[0],
                            link: "updated.link",
                            rank: -200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/${updatedBrand.id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", updatedBrand.link)
                            .field("rank", updatedBrand.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [staticWebContents.brands[1], staticWebContents.brands[2], {...updatedBrand,logoImage:expectImage}] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.brands[2].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given valid brand id and data but logoImage", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const updatedBrand = {
                            ...staticWebContents.brands[2],
                            link: "updated.link.2",
                            rank: 200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/${updatedBrand.id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("link", updatedBrand.link)
                            .field("rank", updatedBrand.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [{...updatedBrand,logoImage:expectImage}, staticWebContents.brands[0], staticWebContents.brands[1]] });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-existing brand id", () => {
                    it("Should return the un-updated staticWebContents object", async () => {
                        const updatedBrand = {
                            ...staticWebContents.brands[2],
                            link: "updated.link.2",
                            rank: 200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/non-existing-id`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("link", updatedBrand.link)
                            .field("rank", updatedBrand.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: staticWebContents.brands });
                    });
                });
                describe("Given non-image file format for logoImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.patch(`${subPath}/${staticWebContents.brands[0].id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
            });
            describe("DELETE", () => {
                describe("Given valid brand id", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const { body, statusCode } = await req.delete(`${subPath}/${staticWebContents.brands[0].id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: [staticWebContents.brands[1], staticWebContents.brands[2]] });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-existing brand id", () => {
                    it("Should return the un-updated staticWebContents object", async () => {
                        const { body, statusCode } = await req.delete(`${subPath}/non-existing-id`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ brands: staticWebContents.brands });
                    });
                });
            });
        });
        describe("/social-links", () => {
            const subPath = `${mainPath}/social-links`;
            describe("POST", () => {
                describe("Given valid social ink data [1]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", socialLink1.link)
                            .field("rank", socialLink1.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [{ ...socialLink1, id: expectString, logoImage: expectImage }] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.socialLinks[0].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given valid social link data [2]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", socialLink2.link)
                            .field("rank", socialLink2.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [{ ...socialLink2, id: expectString, logoImage: expectImage }, staticWebContents.socialLinks[0]] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.socialLinks[0].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given only the logoImage field [3]", () => {
                    it("Should return staticWebContents object", async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [staticWebContents.socialLinks[0], { ...defaultSocialLink, id: expectString, logoImage: expectImage }, staticWebContents.socialLinks[1]] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.socialLinks[1].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given non-image file format for logoImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given no logoImage", () => {
                    it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                        const { body, statusCode } = await req.post(subPath)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                    });
                });
            });
        });
        describe("/social-links/{id}", () => {
            const subPath = `${mainPath}/social-links`;
            describe("PATCH", () => {
                describe("Given valid social link id and data", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const updatedSocialLink = {
                            ...staticWebContents.socialLinks[0],
                            link: "updated.link",
                            rank: -200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/${updatedSocialLink.id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                            .field("link", updatedSocialLink.link)
                            .field("rank", updatedSocialLink.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [staticWebContents.socialLinks[1], staticWebContents.socialLinks[2], {...updatedSocialLink,logoImage:expectImage}] });
                        staticWebContents = { ...staticWebContents, ...body };

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(body.socialLinks[2].logoImage.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();
                    });
                });
                describe("Given valid social link id and data but logoImage", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const updatedSocialLink = {
                            ...staticWebContents.socialLinks[2],
                            link: "updated.link.2",
                            rank: 200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/${updatedSocialLink.id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("link", updatedSocialLink.link)
                            .field("rank", updatedSocialLink.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [{...updatedSocialLink,logoImage:expectImage}, staticWebContents.socialLinks[0], staticWebContents.socialLinks[1]] });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-existing social link id", () => {
                    it("Should return the un-updated staticWebContents object", async () => {
                        const updatedSocialLink = {
                            ...staticWebContents.socialLinks[2],
                            link: "updated.link.2",
                            rank: 200
                        };
                        const { body, statusCode } = await req.patch(`${subPath}/non-existing-id`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .field("link", updatedSocialLink.link)
                            .field("rank", updatedSocialLink.rank);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: staticWebContents.socialLinks });
                    });
                });
                describe("Given non-image file format for logoImage field", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.patch(`${subPath}/${staticWebContents.socialLinks[0].id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`)
                            .attach("logoImage", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
            });
            describe("DELETE", () => {
                describe("Given valid social link id", () => {
                    it("Should return the updated staticWebContents object", async () => {
                        const { body, statusCode } = await req.delete(`${subPath}/${staticWebContents.socialLinks[0].id}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: [staticWebContents.socialLinks[1], staticWebContents.socialLinks[2]] });
                        staticWebContents = { ...staticWebContents, ...body };
                    });
                });
                describe("Given non-existing social link id", () => {
                    it("Should return the un-updated staticWebContents object", async () => {
                        const { body, statusCode } = await req.delete(`${subPath}/non-existing-id`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ socialLinks: staticWebContents.socialLinks });
                    });
                });
            });
        });
        describe("GET", () => {
            describe("Given there are static web contents in the system", () => {
                it("Should return StaticWebContents object", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(staticWebContents);
                });
            });
        });
    });
});