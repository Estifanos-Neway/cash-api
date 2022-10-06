const mongoose = require("mongoose");
const supertest = require("supertest");
const { adminRouter, tokensRouter } = require(".");
const { makeApp } = require("../app");
const { hash } = require("../commons/functions");
const { defaultPort, wrongPasswordHashResponseText, invalidInputResponseText } = require("../commons/variables");
const { defaultAdmin } = require("../config.json");
const { env } = require("../env");
const { signUpAdminRepo } = require("../repositories/admin");

const defaultAdminCredentials = {
    username: defaultAdmin.username,
    passwordHash: hash(defaultAdmin.password)
};

describe("/admin", () => {
    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        await signUpAdminRepo({ ...defaultAdminCredentials });
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    let request, accessToken;
    beforeEach(() => {
        request = supertest(makeApp(defaultPort, adminRouter, tokensRouter));
    });

    describe("/sign-in POST", () => {
        describe("Given valid username and passwordHash", () => {
            it("Should be successfully signed-in.", async () => {
                const { body, statusCode } = await request.post("/admin/sign-in")
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials });

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("admin.username", defaultAdminCredentials.username);
                accessToken = body.accessToken;
            });
        });
    });

    describe("/ GET", () => {
        it("Should return the default admin.", async () => {
            const { body, statusCode } = await request.get("/admin")
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("username", defaultAdminCredentials.username);
        });
    });

    describe("/username PATCH", () => {
        describe("Given a valid username", () => {
            it("Should update the admins username.", async () => {
                let newUsername = "Admin2";
                let { statusCode } = await request.patch("/admin/username")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newUsername });

                let { body } = await request.get("/admin")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("username", newUsername);

                defaultAdminCredentials.username = newUsername;
            });
        });
        describe("Given an invalid username", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let newUsername = ["Admin2"];
                let { statusCode, body } = await request.patch("/admin/username")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newUsername });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
        describe("Given no username", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let { statusCode, body } = await request.patch("/admin/username")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe("/password-hash PATCH", () => {
        describe("Given a valid new and old password hash", () => {
            it("Should update the admins password hash.", async () => {
                let newPasswordHash = "theNewPasswordHash";
                let { statusCode } = await request.patch("/admin/password-hash")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash, oldPasswordHash: defaultAdminCredentials.passwordHash });

                let { body } = await request.post("/admin/sign-in")
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials, passwordHash: newPasswordHash });

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("admin.username", defaultAdminCredentials.username);

            });
        });
        describe("Given an invalid old password hash", () => {
            it(`Should return 400 and ${wrongPasswordHashResponseText}`, async () => {
                let newPasswordHash = "theNewPasswordHash";
                let { statusCode, body } = await request.patch("/admin/password-hash")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash, oldPasswordHash: "wrongOldPasswordHash" });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", wrongPasswordHashResponseText);
            });
        });
        describe("Given no new password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let newPasswordHash = ["theNewPasswordHash"];
                let { statusCode, body } = await request.patch("/admin/password-hash")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash, oldPasswordHash: defaultAdminCredentials.passwordHash });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });
});