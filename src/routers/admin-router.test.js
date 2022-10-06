const mongoose = require("mongoose");
const supertest = require("supertest");
const { adminRouter, tokensRouter } = require(".");
const { makeApp } = require("../app");
const commonFunctions = require("../commons/functions");
const { createVerificationCode } = require("../commons/functions");
const { defaultPort, wrongPasswordHashResponseText, invalidInputResponseText, userNotFoundResponseText } = require("../commons/variables");
const { defaultAdmin } = require("../config.json");
const { env } = require("../env");
const { signUpAdminRepo } = require("../repositories/admin");

const defaultAdminCredentials = {
    username: defaultAdmin.username,
    passwordHash: commonFunctions.hash(defaultAdmin.password)
};

describe("/admin", () => {
    const mainPath = "/admin";

    let emailVerificationCode = "VCODE";
    let request, accessToken, emailVerificationToken;
    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        await signUpAdminRepo({ ...defaultAdminCredentials });
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    beforeEach(() => {
        request = supertest(makeApp(defaultPort, adminRouter, tokensRouter));
    });

    describe("/sign-in POST", () => {
        const subPath = `${mainPath}/sign-in`;
        describe("Given valid username and password hash", () => {
            it("Should be successfully signed-in.", async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials });

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("admin.username", defaultAdminCredentials.username);
                accessToken = body.accessToken;
            });
        });

        describe("Given wrong password hash", () => {
            it(`Should return 404 and ${userNotFoundResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials, passwordHash: "wrongPasswordHash" });

                expect(statusCode).toBe(404);
                expect(body).toHaveProperty("message", userNotFoundResponseText);
            });
        });

        describe("Given wrong username", () => {
            it(`Should return 404 and ${userNotFoundResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials, username: "wrongUsername" });

                expect(statusCode).toBe(404);
                expect(body).toHaveProperty("message", userNotFoundResponseText);
            });
        });

        describe("Given wrong username and wrong password hash", () => {
            it(`Should return 404 and ${userNotFoundResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ username: "wrongUsername", passwordHash: "wrongPasswordHash" });

                expect(statusCode).toBe(404);
                expect(body).toHaveProperty("message", userNotFoundResponseText);
            });
        });

        describe("Given invalid username", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...defaultAdminCredentials, username: ["invalidUsernameFormat"], });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });

        describe("Given no password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ username: defaultAdminCredentials.username });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe(`${mainPath}/ GET`, () => {
        const subPath = `${mainPath}`;
        it("Should return the default admin.", async () => {
            const { body, statusCode } = await request.get(subPath)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("username", defaultAdminCredentials.username);
        });
    });

    describe("/username PATCH", () => {
        const subPath = `${mainPath}/username`;
        describe("Given a valid username", () => {
            it("Should update the admins username.", async () => {
                let newUsername = "Admin2";
                let { statusCode } = await request.patch(subPath)
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
                let { statusCode, body } = await request.patch(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newUsername });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
        describe("Given no username", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let { statusCode, body } = await request.patch(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe("/password-hash PATCH", () => {
        const subPath = `${mainPath}/password-hash`;
        describe("Given a valid new and old password hash", () => {
            it("Should update the admins password hash.", async () => {
                let newPasswordHash = "theNewPasswordHash";
                let { statusCode } = await request.patch(subPath)
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
                let { statusCode, body } = await request.patch(subPath)
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
                let { statusCode, body } = await request.patch(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash, oldPasswordHash: defaultAdminCredentials.passwordHash });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe("/settings GET", () => {
        const subPath = `${mainPath}/settings`;
        it("Should return the admin settings.", async () => {
            const { body, statusCode } = await request.get(subPath)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("commissionRate", expect.any(Number));
        });
    });

    describe("/email", () => {
        const subPath = `${mainPath}/email`;
        describe("Given valid email", () => {
            it("Should send a verification code to the admins email", async () => {
                const sendEmailMock = jest.spyOn(commonFunctions, "sendEmail").mockReturnValue(Promise.resolve(true));
                const createVerificationCodeMock = jest.spyOn(commonFunctions, "createVerificationCode").mockReturnValue(emailVerificationCode);
                const newEmail = "estifanos.neway.d@gmail.com";
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newEmail });

                // let { body: admin } = await request.get("/admin")
                //     .set("Api-Key", env.API_KEY)
                //     .set("Authorization", `Bearer ${accessToken}`);

                expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: "Email verification", html: `Verification code: ${emailVerificationCode}`, to: newEmail });
                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("verificationToken", expect.any(String));
                // expect(admin).toHaveProperty("email", newEmail);

                emailVerificationToken = body["verificationToken"];
            });
        });
    });
});