const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../configs");
const { hash } = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const testUtils = require("./test.utils");

describe("/static-web-contents", () => {
    testUtils.setJestTimeout();
    const mainPath = "/static-web-contents";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    const staticWebContents = {
        videoLinks: {
            whoAreWe: "whoAreWeLink"
        }
    };
    let req, accessToken;

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
                    expect(body).toEqual({});
                });
            });
        });
        describe("PUT", () => {
            describe("Given valid but incomplete StaticWebContents object", () => {
                it("Should return the object", async () => {
                    const { body, statusCode } = await req.put(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(staticWebContents);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(staticWebContents);
                });
            });
            describe("Given valid but incomplete StaticWebContents object", () => {
                it("Should return the updated object", async () => {
                    staticWebContents.videoLinks.howToAffiliateWithUs = "howToAffiliateWithUsLink";
                    const { body, statusCode } = await req.put(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(staticWebContents);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(staticWebContents);
                });
            });
            describe("Given empty object", () => {
                it("Should return the existing (non-updated) object", async () => {
                    const { body, statusCode } = await req.put(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({});
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(staticWebContents);
                });
            });
            describe("Given invalid videoLinks.whoAreWe", () => {
                it(`Should return 400 and ${rt.invalidWhoAreWeVideoLink}`, async () => {
                    const { body, statusCode } = await req.put(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ videoLinks: { whoAreWe: ["invalid"] } });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidWhoAreWeVideoLink));
                });
            });
            describe("Given invalid videoLinks.howToAffiliateWithUs", () => {
                it(`Should return 400 and ${rt.invalidHowToAffiliateWithUsVideoLink}`, async () => {
                    const { body, statusCode } = await req.put(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ videoLinks: { howToAffiliateWithUs: ["invalid"] } });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidHowToAffiliateWithUsVideoLink));
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