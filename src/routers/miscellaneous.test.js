const mongoose = require("mongoose");
const supertest = require("supertest");
const { adminRouter, tokensRouter } = require(".");
const { makeApp } = require("../app");
const { defaultPort, pathNotFoundResponseText, invalidApiKeyResponseText, invalidAccessTokenResponseText } = require("../commons/variables");
const { createUserData, createAccessToken } = require("../controllers/controller-commons/functions");
const { env } = require("../env");


describe("Miscellaneous", () => {

    let request;
    const somePath = "/some-path";

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
    });

    beforeEach(async () => {
        request = supertest(makeApp(defaultPort, adminRouter, tokensRouter));
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("Given no api key", () => {
        it(`Should return 401 and ${invalidApiKeyResponseText}`, async () => {
            const { body, statusCode } = await request.get(somePath);

            expect(statusCode).toBe(401);
            expect(body).toHaveProperty("message", invalidApiKeyResponseText);
        });
    });


    describe("Given unknown path", () => {
        const unknownPath = "/unknown-path";
        it(`Should return 404 and ${pathNotFoundResponseText}`, async () => {
            const { body, statusCode } = await request.get(unknownPath)
                .set("Api-Key", env.API_KEY);

            expect(statusCode).toBe(404);
            expect(body).toHaveProperty("message", pathNotFoundResponseText);
        });
    });


    describe("Forcing Access Token", () => {
        const subPath = "/admin";
        describe("Given no access token", () => {
            it(`Should return 401 and ${invalidAccessTokenResponseText}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY);

                expect(statusCode).toBe(401);
                expect(body).toHaveProperty("message", invalidAccessTokenResponseText);
            });
        });

        describe("Given invalid access token (format)", () => {
            it(`Should return 401 and ${invalidAccessTokenResponseText}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", "Bearer invalidAccessToken");

                expect(statusCode).toBe(401);
                expect(body).toHaveProperty("message", invalidAccessTokenResponseText);
            });
        });

        describe("Given invalid access token (non-admin)", () => {
            it(`Should return 401 and ${invalidAccessTokenResponseText}`, async () => {
                const invalidUserData = createUserData("invalidUserId", "notAdmin");
                const invalidAccessToken = createAccessToken(invalidUserData);
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${invalidAccessToken}`);

                expect(statusCode).toBe(401);
                expect(body).toHaveProperty("message", invalidAccessTokenResponseText);
            });
        });
    });
});