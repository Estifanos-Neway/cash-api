const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const { hash } = require("../../commons/functions");
const rt = require("../../commons/response-texts");
const { defaultAdmin } = require("../../config.json");
const { createUserData, createAccessToken, createSingleResponse } = require("../../controllers/controller-commons/functions");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");

describe("/tokens", () => {
    const mainPath = "/tokens";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    let request, accessToken, refreshToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        await adminsRepo.signUp({ ...adminCredentials });
    });

    beforeEach(async () => {
        request = supertest(makeApp());
        // @ts-ignore
        const { body } = await request.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send({ ...adminCredentials });
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("/refresh GET", () => {
        const subPath = `${mainPath}/refresh`;
        describe("Given valid refresh token", () => {
            it("Should return an access token", async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("newAccessToken", expect.any(String));
            });
        });

        describe("Given invalid refresh token", () => {
            it(`Should return 401 and ${rt.invalidRefreshToken}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Refresh-Token", "invalidRefreshToken");

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidRefreshToken));
            });
        });

        describe("Given invalid access token (non matching userId)", () => {
            const invalidUserData = createUserData("invalidUserId", "admin");
            const invalidAccessToken = createAccessToken(invalidUserData);
            it(`Should return 401 and ${rt.noneMatchingTokens}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${invalidAccessToken}`)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.noneMatchingTokens));
            });
        });

        describe("Given invalid access token (invalid format)", () => {
            it(`Should return 401 and ${rt.noneMatchingTokens}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", "Bearer invalidAccessToken")
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidAccessToken));
            });
        });

        describe("Given no refresh token", () => {
            it(`Should return 400 and ${rt.invalidInput}`, async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

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
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Refresh-Token", `${refreshToken}`);

                const { body, statusCode: statusCode2 } = await request.get("/tokens/refresh")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(200);
                expect(statusCode2).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidRefreshToken));
            });
        });

        describe("Given invalid refresh token", () => {
            it(`Should return 401 and ${rt.invalidRefreshToken}`, async () => {
                const { body, statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Refresh-Token", "invalidRefreshToken");

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidRefreshToken));
            });
        });

        describe("Given invalid access token (non matching userId)", () => {
            const invalidUserData = createUserData("invalidUserId", "admin");
            const invalidAccessToken = createAccessToken(invalidUserData);
            it(`Should return 401 and ${rt.noneMatchingTokens}`, async () => {
                const { body, statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${invalidAccessToken}`)
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.noneMatchingTokens));
            });
        });

        describe("Given invalid access token (invalid format)", () => {
            it(`Should return 401 and ${rt.noneMatchingTokens}`, async () => {
                const { body, statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", "Bearer invalidAccessToken")
                    .set("Refresh-Token", `${refreshToken}`);

                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.invalidAccessToken));
            });
        });

        describe("Given no refresh token", () => {
            it(`Should return 400 and ${rt.invalidInput}`, async () => {
                const { body, statusCode } = await request.delete(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidInput));
            });
        });
    });
});