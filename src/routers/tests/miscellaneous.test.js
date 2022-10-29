const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const { User } = require("../../entities");
const { env } = require("../../env");
const testUtils = require("./test.utils");

describe("/Miscellaneous", () => {
    testUtils.setJestTimeout();
    let request;
    const adminsPath = "/admin";
    const somePath = "/some-path";
    const unknownPath = "/unknown-path";

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
    });

    beforeEach(async () => {
        request = supertest(makeApp());
    });

    afterAll(async () => {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
    });

    describe(`Given no api key: ${somePath} GET`, () => {
        it(`Should return 401 and ${rt.invalidApiKey}`, async () => {
            const { body, statusCode } = await request.get(somePath);

            expect(statusCode).toBe(401);
            expect(body).toEqual(createSingleResponse(rt.invalidApiKey));
        });
    });


    describe(`Given unknown path ${unknownPath} GET`, () => {
        it(`Should return 404 and ${rt.pathNotFound}`, async () => {
            const { body, statusCode } = await request.get(unknownPath)
                .set("Api-Key", env.API_KEY);

            expect(statusCode).toBe(404);
            expect(body).toEqual(createSingleResponse(rt.pathNotFound));
        });
    });


    describe(`Forcing Access Token: ${adminsPath} GET`, () => {
        describe("Given no access token", () => {
            it(`Should return 401 and ${rt.unauthorized}`, async () => {
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.unauthorized));
            });
        });

        describe("Given invalid access token (format)", () => {
            it(`Should return 401 and ${rt.unauthorized}`, async () => {
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", "Bearer invalidAccessToken");

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.unauthorized));
            });
        });

        describe("Given invalid access token (non-admin)", () => {
            it(`Should return 401 and ${rt.unauthorized}`, async () => {
                const invalidUser = new User({ userId: "invalidUserId", userType: User.userTypes.Affiliate });
                const invalidAccessToken = invalidUser.createAccessToken();
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${invalidAccessToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.unauthorized));
            });
        });
    });
});