const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const { hash } = require("../../commons/functions");
const rt = require("../../commons/response-texts");
const { defaultAdmin } = require("../../configs");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const testUtils = require("./test.utils");

describe("/sessions", () => {
    testUtils.setJestTimeout();
    const mainPath = "/sessions";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    let request, refreshToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
        await adminsRepo.signUp({ ...adminCredentials });
        request = supertest(makeApp());
        // @ts-ignore
        const { body } = await request.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send({ ...adminCredentials });
        refreshToken = body.refreshToken;
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

    describe("/refresh GET", () => {
        const subPath = `${mainPath}/refresh`;
        describe("Given valid refresh token", () => {
            it("Should return an access token", async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("newAccessToken", expect.any(String));
            });
        });

        describe("Given invalid refresh token", () => {
            it(`Should return 401 and ${rt.invalidRefreshToken}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Refresh-Token", "invalidRefreshToken");

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidRefreshToken));
            });
        });

        describe("Given no refresh token", () => {
            it(`Should return 400 and ${rt.invalidInput}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY);

                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidInput));
            });
        });
    });

    describe("/sign-out DELETE", () => {
        const subPath = `${mainPath}/sign-out`;
        describe("Given valid refresh token", () => {
            it("Should invalidate the refresh token", async () => {
                const { statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Refresh-Token", `${refreshToken}`);

                const { body, statusCode: statusCode2 } = await request.get("/sessions/refresh")
                    .set("Api-Key", env.API_KEY)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(200);
                expect(statusCode2).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidRefreshToken));
            });
        });

        describe("Given no refresh token", () => {
            it(`Should return 400 and ${rt.invalidInput}`, async () => {
                const { body, statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY);

                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidInput));
            });
        });
    });
});