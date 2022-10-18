const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createUserData, createAccessToken, createSingleResponse } = require("../../controllers/controller-commons/functions");
const { env } = require("../../env");

describe("Miscellaneous", () => {
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

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
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
            it(`Should return 401 and ${rt.invalidAccessToken}`, async () => {
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidAccessToken));
            });
        });

        describe("Given invalid access token (format)", () => {
            it(`Should return 401 and ${rt.invalidAccessToken}`, async () => {
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", "Bearer invalidAccessToken");

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidAccessToken));
            });
        });

        describe("Given invalid access token (non-admin)", () => {
            it(`Should return 401 and ${rt.invalidAccessToken}`, async () => {
                const invalidUserData = createUserData("invalidUserId", "notAdmin");
                const invalidAccessToken = createAccessToken(invalidUserData);
                const { body, statusCode } = await request.get(adminsPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${invalidAccessToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidAccessToken));
            });
        });
    });
});