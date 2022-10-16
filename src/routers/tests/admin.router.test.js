const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const commonFunctions = require("../../commons/functions");
const { hash, encrypt } = require("../../commons/functions");
const {
    wrongPasswordHashResponseText,
    invalidInputResponseText,
    userNotFoundResponseText,
    invalidEmailResponseText,
    invalidVerificationCodeResponseText,
    invalidTokenResponseText,
    expiredTokenResponseText,
    invalidInput, } = require("../../commons/response-texts");
const { verificationTokenExpiresIn } = require("../../commons/variables");
const { defaultAdmin } = require("../../config.json");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");

const adminCredentials = {
    username: defaultAdmin.username,
    passwordHash: hash(defaultAdmin.password)
};

describe("/admin", () => {
    const mainPath = "/admin";
    const newEmail = "estifanos.neway.d@gmail.com";
    let emailVerificationCode = "VCODE";
    let request, accessToken, emailVerificationToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        await adminsRepo.signUp(adminCredentials);
    });

    beforeEach(() => {
        request = supertest(makeApp());
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("/sign-in POST", () => {
        const subPath = `${mainPath}/sign-in`;
        describe("Given valid username and password hash", () => {
            it("Should be successfully signed-in.", async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send(adminCredentials);

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("admin.username", adminCredentials.username);
                accessToken = body.accessToken;
            });
        });

        describe("Given wrong password hash", () => {
            it(`Should return 404 and ${userNotFoundResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...adminCredentials, passwordHash: "wrongPasswordHash" });

                expect(statusCode).toBe(404);
                expect(body).toHaveProperty("message", userNotFoundResponseText);
            });
        });

        describe("Given wrong username", () => {
            it(`Should return 404 and ${userNotFoundResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...adminCredentials, username: "wrongUsername" });

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
                    .send({ ...adminCredentials, username: ["invalidUsernameFormat"], });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });

        describe("Given no password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ username: adminCredentials.username });

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
            expect(body).toHaveProperty("username", adminCredentials.username);
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

                adminCredentials.username = newUsername;
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
                    .send({ newPasswordHash, oldPasswordHash: adminCredentials.passwordHash });

                let { body } = await request.post("/admin/sign-in")
                    .set("Api-Key", env.API_KEY)
                    .send({ ...adminCredentials, passwordHash: newPasswordHash });

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("admin.username", adminCredentials.username);

                adminCredentials.passwordHash = newPasswordHash;
            });
        });

        describe("Given wrong old password hash", () => {
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

        describe("Given invalid new password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let newPasswordHash = ["theNewPasswordHash"];
                let { statusCode, body } = await request.patch(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash, oldPasswordHash: adminCredentials.passwordHash });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });

        describe("Given no new and old password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                let { statusCode, body } = await request.patch(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

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

    describe("/email PUT", () => {
        const subPath = `${mainPath}/email`;
        describe("Given a valid email", () => {
            it("Should send a verification code to the admins email", async () => {
                const sendEmailMock = jest.spyOn(commonFunctions, "sendEmail").mockReturnValue(Promise.resolve(true));
                const createVerificationCodeMock = jest.spyOn(commonFunctions, "createVerificationCode").mockReturnValue(emailVerificationCode);
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newEmail });

                expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: "Email verification", html: `Verification code: ${emailVerificationCode}`, to: newEmail });
                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("verificationToken", expect.any(String));

                emailVerificationToken = body["verificationToken"];
            });
        });

        describe("Given an invalid email format", () => {
            it(`Should return 400 and ${invalidEmailResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newEmail: "invalidEmail" });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidEmailResponseText);
            });
        });

        describe("Given an invalid email", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newEmail: ["invalidEmail"] });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });

        describe("Given no email", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe("/verify-email PUT", () => {
        const subPath = `${mainPath}/verify-email`;
        describe("Given valid verificationCode and verificationToken", () => {
            it("Should update the admins email", async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send(
                        {
                            verificationCode: emailVerificationCode,
                            verificationToken: emailVerificationToken
                        });
                let { body: admin } = await request.get("/admin")
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(200);
                expect(body).toHaveProperty("newEmail", newEmail);
                expect(admin).toHaveProperty("email", newEmail);
            });
        });

        describe("Given invalid verificationCode", () => {
            it(`Should return 400 and ${invalidVerificationCodeResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send(
                        {
                            verificationCode: "invalidVerificationCode",
                            verificationToken: emailVerificationToken
                        }
                    );

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidVerificationCodeResponseText);
            });
        });

        describe("Given invalid verificationToken", () => {
            it(`Should return 400 and ${invalidTokenResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send(
                        {
                            verificationCode: emailVerificationCode,
                            verificationToken: "invalidVerificationToken"
                        });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidTokenResponseText);
            });
        });

        describe("Given an expired verificationToken", () => {
            it(`Should return 408 and ${expiredTokenResponseText}`, async () => {
                const expiredVerificationObject = {
                    validUntil: 0,
                    email: newEmail,
                    verificationCode: emailVerificationCode
                };

                const expiredVerificationToken = encrypt(expiredVerificationObject);
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send(
                        {
                            verificationCode: emailVerificationCode,
                            verificationToken: expiredVerificationToken
                        });
                expect(statusCode).toBe(408);
                expect(body).toHaveProperty("message", expiredTokenResponseText);
            });
        });

        describe("Given no verificationCode and verificationToken ", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });

    describe("/forgot-password PUT", () => {
        const subPath = `${mainPath}/forgot-password`;
        describe("Given a valid email", () => {
            it("Should send a recovery link to the admins email", async () => {
                const sendEmailMock = jest.spyOn(commonFunctions, "sendEmail").mockReturnValue(Promise.resolve(true));
                const { statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`).
                    send({ email: newEmail });
                expect(statusCode).toBe(200);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: "Password recovery", html: expect.any(String), to: newEmail });
            });
        });
        describe("Given an invalid email (non-matching)", () => {
            it("Should send a recovery link to the admins email", async () => {
                const { statusCode, body } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`).
                    send({ email: "nottheadmins@example.come" });
                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidEmailResponseText);
            });
        });
        describe("Given an invalid email (invalid email)", () => {
            it("Should send a recovery link to the admins email", async () => {
                const { statusCode, body } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`).
                    send({ email: [newEmail] });
                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidEmailResponseText);
            });
        });
        describe("Given no email", () => {
            it("Should send a recovery link to the admins email", async () => {
                const { statusCode, body } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInput);
            });
        });
    });

    describe("/recover-password PUT", () => {
        const subPath = `${mainPath}/recover-password`;
        describe("Given valid recovery token and new password hash", () => {
            it("Should update the admins password hash", async () => {
                const anotherNewPasswordHash = "anotherNewPasswordHash";
                const recoveryObject = {
                    validUntil: new Date().getTime() + verificationTokenExpiresIn * 60 * 1000,
                    email: newEmail
                };
                // @ts-ignore
                const recoveryToken = jwt.sign(recoveryObject, env.JWT_SECRETE);
                const { statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash: anotherNewPasswordHash, recoveryToken });

                let { body: admin } = await request.post("/admin/sign-in")
                    .set("Api-Key", env.API_KEY)
                    .send({ ...adminCredentials, passwordHash: anotherNewPasswordHash });

                expect(statusCode).toBe(200);
                expect(admin).toHaveProperty("admin.username", adminCredentials.username);

                adminCredentials.passwordHash = anotherNewPasswordHash;
            });
        });

        describe("Given invalid recovery token", () => {
            it(`Should return 400 and ${invalidTokenResponseText}`, async () => {
                const anotherNewPasswordHash = "anotherNewPasswordHash";
                const recoveryToken = "invalidRecoveryToken";
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash: anotherNewPasswordHash, recoveryToken });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidTokenResponseText);
            });
        });

        describe("Given expired recovery token", () => {
            it(`Should return 408 and ${expiredTokenResponseText}`, async () => {
                const anotherNewPasswordHash = "anotherNewPasswordHash";
                const recoveryObject = {
                    validUntil: 0,
                    email: newEmail
                };
                // @ts-ignore
                const recoveryToken = jwt.sign(recoveryObject, env.JWT_SECRETE);
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash: anotherNewPasswordHash, recoveryToken });
                expect(statusCode).toBe(408);
                expect(body).toHaveProperty("message", expiredTokenResponseText);
            });
        });

        describe("Given invalid new password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const anotherNewPasswordHash = ["anotherNewPasswordHash"];
                const recoveryObject = {
                    validUntil: new Date().getTime() + verificationTokenExpiresIn * 60 * 1000,
                    email: newEmail
                };
                // @ts-ignore
                const recoveryToken = jwt.sign(recoveryObject, env.JWT_SECRETE);
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ newPasswordHash: anotherNewPasswordHash, recoveryToken });

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });

        describe("Given no recovery token and new password hash", () => {
            it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                const { body, statusCode } = await request.put(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);

                expect(statusCode).toBe(400);
                expect(body).toHaveProperty("message", invalidInputResponseText);
            });
        });
    });
});