const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const utils = require("../../commons/functions");
const config = require("../../configs");
const rt = require("../../commons/response-texts");
const { defaultAdmin } = require("../../configs");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const { User } = require("../../entities");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const signUpVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "sign-up-verification.email.html"), { encoding: "utf-8" });
const emailVerificationEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "email-verification.email.html"), { encoding: "utf-8" });
const testUtils = require("./test.utils");
const emailSubjects = require("../../assets/emails/email-subjects.json");

describe("/affiliates", () => {
    testUtils.setJestTimeout();
    const mainPath = "/affiliates";
    const verificationCode = "vCODE";
    // @ts-ignore
    const signUpVerificationEmailHtml = utils.replaceAll(signUpVerificationEmail, "__verificationCode__", verificationCode);
    const emailVerificationEmailHtml = utils.replaceAll(emailVerificationEmail, "__verificationCode__", verificationCode);
    const passwordHash = "pwh";
    const newPasswordHash = "n-pwh";
    const newPasswordHash2 = "n-pwh-2";
    const newPhone = "+251900000000";
    const newFullName = "Affiliate-New";
    const newEmail = "affiliate.new@gmail.com";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: utils.hash(defaultAdmin.password)
    };
    let affiliateA = {
        fullName: "Affiliate-A",
        phone: "+251987654321",
        email: "cashmart.et@gmail.com",
        passwordHash
    };
    let affiliateB = {
        fullName: "Affiliate-B",
        phone: "+251987654322",
        email: "affiliate.b@gmail.com",
        passwordHash,
        parentId: undefined
    };
    let affiliateC = {
        fullName: "Affiliate-C",
        phone: "+251987654222",
        email: "affiliate.c@gmail.com",
        passwordHash
    };
    let affiliateD = {
        fullName: "Affiliate-D",
        phone: "+251987652222",
        email: "affiliate.d@gmail.com",
        passwordHash
    };
    let affiliateE = {
        fullName: "Affiliate-E",
        phone: "+251987622222",
        email: "affiliate.e@gmail.com",
        passwordHash
    };
    let affiliateF = {
        fullName: "Affiliate-F",
        phone: "+251987222222",
        email: "affiliate.f@gmail.com",
        passwordHash
    };
    const walletAndAffiliations = {
        wallet: {
            totalMade: config.affiliatesWallet.initialBalance,
            currentBalance: config.affiliatesWallet.initialBalance,
            canWithdrawAfter: config.affiliatesWallet.canWithdrawAfter
        },
        affiliationSummary: {
            totalRequests: 0,
            acceptedRequests: 0,
            rejectedRequests: 0
        }
    };
    let
        accessTokenA,
        accessTokenC,
        signUpVerificationTokenA,
        signUpVerificationTokenB,
        signUpVerificationTokenC;
    let signUpVerificationTokenFake = utils.encrypt(JSON.stringify(
        {
            affiliate: affiliateD,
            verificationCode,
            validUntil: new Date().getTime() + (60 * 60 * 1000)
        }
    ));
    let signUpVerificationTokenExistingEmail = utils.encrypt(JSON.stringify(
        {
            affiliate: { ...affiliateD, email: affiliateA.email },
            verificationCode,
            validUntil: new Date().getTime() + (60 * 60 * 1000)
        }
    ));
    let signUpVerificationTokenExistingPhone = utils.encrypt(JSON.stringify(
        {
            affiliate: { ...affiliateD, phone: affiliateA.phone },
            verificationCode,
            validUntil: new Date().getTime() + (60 * 60 * 1000)
        }
    ));
    let signUpVerificationTokenExpired = utils.encrypt(JSON.stringify(
        {
            affiliate: affiliateD,
            verificationCode,
            validUntil: 0
        }
    ));

    let emailVerificationToken;
    let emailVerificationTokenFake = utils.encrypt(JSON.stringify(
        {
            userId: utils.generateDbId(),
            email: "email@gmail.com",
            verificationCode,
            validUntil: new Date().getTime() + (60 * 60 * 1000)
        }
    ));
    let emailVerificationTokenExpired = utils.encrypt(JSON.stringify(
        {
            userId: utils.generateDbId(),
            email: "email@gmail.com",
            verificationCode,
            validUntil: 0
        }
    ));
    const today = new Date().toISOString().split("T")[0];
    const expectToday = expect.stringMatching(`^${today}T.+$`);
    const expectAvatarImage = { path: expect.stringMatching(/^\/images\/avatars\/.+$/) };
    let req, adminAccessToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
        await adminsRepo.signUp(adminCredentials);
        req = supertest(makeApp());
        // @ts-ignore
        const { body } = await req.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send(adminCredentials);
        adminAccessToken = body.accessToken;
    });

    beforeEach(() => {
        req = supertest(makeApp());
    });

    afterAll(async () => {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
    });

    describe("/sign-up and /verify-sign-up POST", () => {
        afterAll(async () => {
            const { body: bodyA, statusCode: statusCodeA } = await req.get(`${mainPath}/${affiliateA.userId}`)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${adminAccessToken}`);
            expect(statusCodeA).toBe(200);
            affiliateA = bodyA;
            const { body: bodyB, statusCode: statusCodeB } = await req.get(`${mainPath}/${affiliateB.userId}`)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${adminAccessToken}`);
            expect(statusCodeB).toBe(200);
            affiliateB = bodyB;
            const { body: bodyC, statusCode: statusCodeC } = await req.get(`${mainPath}/${affiliateC.userId}`)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${adminAccessToken}`);
            expect(statusCodeC).toBe(200);
            affiliateC = bodyC;
        });
        const signUpPath = `${mainPath}/sign-up`;
        const verifySignUpPath = `${mainPath}/verify-sign-up`;
        describe("[/sign-up] Given valid affiliate data", () => {
            it("Should send verification email and return verification token", async () => {
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const createVerificationCodeMock = jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send(affiliateA);
                expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.emailVerification, html: signUpVerificationEmailHtml, to: affiliateA.email });
                expect(statusCode).toBe(200);
                expect(body).toEqual({ verificationToken: expect.any(String) });
                signUpVerificationTokenA = body.verificationToken;
            });
        });
        describe("[/verify-sign-up] Given valid verification data", () => {
            it("Should sign up and sign in the affiliate and return sign in data", async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenA, verificationCode });
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    affiliate: {
                        ...affiliateA,
                        ...walletAndAffiliations,
                        userId: expect.any(String),
                        passwordHash: undefined,
                        memberSince: expectToday
                    },
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
                affiliateA = body.affiliate;
                accessTokenA = body.accessToken;
                affiliateB.parentId = affiliateA.userId;
            });
        });
        describe("[/sign-up] Given valid affiliate data [with valid parent id]", () => {
            it("Should send verification email and return verification token", async () => {
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const createVerificationCodeMock = jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send(affiliateB);
                expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.emailVerification, html: signUpVerificationEmailHtml, to: affiliateB.email });
                expect(statusCode).toBe(200);
                expect(body).toEqual({ verificationToken: expect.any(String) });
                signUpVerificationTokenB = body.verificationToken;
            });
        });
        describe("[/verify-sign-up] Given valid verification data [with parent id]", () => {
            it("Should sign up and sign in the affiliate and return sign in data [with parent id]", async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenB, verificationCode });
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    affiliate: {
                        ...affiliateB,
                        ...walletAndAffiliations,
                        userId: expect.any(String),
                        passwordHash: undefined,
                        parentId: affiliateA.userId,
                        memberSince: expectToday
                    },
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
                affiliateB = body.affiliate;
            });
        });
        describe("[/sign-up] Given valid affiliate data [with valid but non-existing parent id]", () => {
            it("Should send verification email and return verification token", async () => {
                affiliateC.parentId = utils.generateDbId();
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const createVerificationCodeMock = jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send(affiliateC);
                expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.emailVerification, html: signUpVerificationEmailHtml, to: affiliateC.email });
                expect(statusCode).toBe(200);
                expect(body).toEqual({ verificationToken: expect.any(String) });
                signUpVerificationTokenC = body.verificationToken;
            });
        });
        describe("[/verify-sign-up] Given valid verification data [with valid but non-existing parent id]", () => {
            it("Should sign up and sin in the affiliate [with no parent id] and return sign in data", async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenC, verificationCode });
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    affiliate: {
                        ...affiliateC,
                        ...walletAndAffiliations,
                        userId: expect.any(String),
                        passwordHash: undefined,
                        parentId: undefined,
                        memberSince: expectToday
                    },
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
                affiliateC = body.affiliate;
                accessTokenC = body.accessToken;
            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidFullName}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, fullName: ["invalid-full-name"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidFullName));
            });
        });
        describe("[/sign-up] Given invalid phone [1]", () => {
            it(`Should return 400 and ${rt.invalidPhone}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, phone: "invalid-phone [1]" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPhone));
            });
        });
        describe("[/sign-up] Given invalid phone [2]", () => {
            it(`Should return 400 and ${rt.invalidPhone}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, phone: ["invalid-phone [2]"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPhone));
            });
        });
        describe("[/sign-up] Given invalid email [1]", () => {
            it(`Should return 400 and ${rt.invalidEmail}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, email: "invalid-email [1]" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidEmail));
            });
        });
        describe("[/sign-up] Given invalid email [2]", () => {
            it(`Should return 400 and ${rt.invalidEmail}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, email: ["invalid-email [2]"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidEmail));
            });
        });
        describe("[/sign-up] Given invalid password hash", () => {
            it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, passwordHash: ["invalid-password-hash"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
            });
        });
        describe("[/sign-up] Given existing email", () => {
            it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, email: affiliateA.email.toUpperCase() });
                expect(statusCode).toBe(409);
                expect(body).toEqual(createSingleResponse(rt.affiliateEmailAlreadyExist));
            });
        });
        describe("[/sign-up] Given existing phone", () => {
            it(`Should return 409 and ${rt.affiliatePhoneAlreadyExist}`, async () => {
                const { statusCode, body } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...affiliateD, phone: affiliateA.phone.slice(4) });
                expect(statusCode).toBe(409);
                expect(body).toEqual(createSingleResponse(rt.affiliatePhoneAlreadyExist));
            });
        });
        describe("[/verify-sign-up] Given invalid verification token", () => {
            it(`Should return 400 and ${rt.invalidToken}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: ["invalid-token"], verificationCode });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidToken));
            });
        });
        describe("[/verify-sign-up] Given invalid verification code", () => {
            it(`Should return 400 and ${rt.invalidVerificationCode}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenFake, verificationCode: ["invalid"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidVerificationCode));
            });
        });
        describe("[/verify-sign-up] Given wrong verification code", () => {
            it(`Should return 401 and ${rt.wrongVerificationCode}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenFake, verificationCode: "wrong" });
                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.wrongVerificationCode));
            });
        });
        describe("[/verify-sign-up] Given expired verification token", () => {
            it(`Should return 408 and ${rt.expiredToken}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenExpired, verificationCode });
                expect(statusCode).toBe(408);
                expect(body).toEqual(createSingleResponse(rt.expiredToken));
            });
        });
        describe("[/verify-sign-up] Given existing email", () => {
            it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenExistingEmail, verificationCode });
                expect(statusCode).toBe(409);
                expect(body).toEqual(createSingleResponse(rt.affiliateEmailAlreadyExist));
            });
        });
        describe("[/verify-sign-up] Given existing phone", () => {
            it(`Should return 409 and ${rt.affiliatePhoneAlreadyExist}`, async () => {
                const { statusCode, body } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: signUpVerificationTokenExistingPhone, verificationCode });
                expect(statusCode).toBe(409);
                expect(body).toEqual(createSingleResponse(rt.affiliatePhoneAlreadyExist));
            });
        });
    });
    describe("/sign-in POST", () => {
        const subPath = `${mainPath}/sign-in`;
        describe("Given valid affiliate credentials [email]", () => {
            it("Should return affiliate sign in data", async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.email, passwordHash });
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    affiliate: affiliateA,
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
            });
        });
        describe("Given valid affiliate credentials [phone]", () => {
            it("Should return affiliate sign in data", async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.phone, passwordHash });
                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    affiliate: affiliateA,
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
            });
        });
        describe("Given invalid phoneOrEmail", () => {
            it(`Should return 400 and ${rt.invalidPhoneOrEmail}`, async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: ["invalid"], passwordHash });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPhoneOrEmail));
            });
        });
        describe("Given invalid passwordHash", () => {
            it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.phone, passwordHash: ["invalid"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
            });
        });
        describe("Given valid phone or email and wrong passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.phone, passwordHash: "wrong" });
                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.wrongCredentials));
            });
        });
        describe("Given wrong phone or email and valid passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: "999999999", passwordHash });
                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.wrongCredentials));
            });
        });
        describe("Given wrong phone or email and wrong passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {
                const { statusCode, body } = await req.post(subPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: "999999999", passwordHash: "wrong" });
                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.wrongCredentials));
            });
        });
    });
    describe("/ GET", () => {
        describe("Given no params", () => {
            it("Should return list of affiliates", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`);
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateC, affiliateB, affiliateA]);
            });
        });
        describe("Given query filter={fullName:'Affiliate-B'}", () => {
            it("Should return [affiliateB]", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ filter: JSON.stringify({ fullName: affiliateB.fullName }) });
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateB]);
            });
        });
        describe("Given query search={fullName:'[a,c]$'}", () => {
            it("Should return [affiliateA,affiliateC]", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ search: JSON.stringify({ fullName: "[a,c]$" }) });
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateC, affiliateA]);
            });
        });
        describe("Given query limit=2", () => {
            it("Should return [affiliateC,affiliateB]", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ limit: 2 });
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateC, affiliateB]);
            });
        });
        describe("Given query skip=1", () => {
            it("Should return [affiliateB,affiliateA]", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ skip: 1 });
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateB, affiliateA]);
            });
        });
        describe("Given query select=['fullName', 'memberSince']", () => {
            it("Should return affiliates with full name and member since only", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ select: JSON.stringify(["fullName", "memberSince"]) });
                expect(statusCode).toBe(200);
                expect(body).toEqual([
                    {
                        userId: affiliateC.userId,
                        fullName: affiliateC.fullName,
                        memberSince: affiliateC.memberSince
                    },
                    {
                        userId: affiliateB.userId,
                        fullName: affiliateB.fullName,
                        memberSince: affiliateB.memberSince
                    },
                    {
                        userId: affiliateA.userId,
                        fullName: affiliateA.fullName,
                        memberSince: affiliateA.memberSince
                    },
                ]);
            });
        });
        describe("Given query sort={fullName: 1}", () => {
            it("Should return [affiliateA, affiliateB, affiliateC]", async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ sort: JSON.stringify({ "fullName": 1 }) });
                expect(statusCode).toBe(200);
                expect(body).toEqual([affiliateA, affiliateB, affiliateC]);
            });
        });
        describe("Given invalid search query", () => {
            it(`Should return 400 and ${rt.invalidSearchQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ search: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidSearchQuery));
            });
        });
        describe("Given invalid filter query", () => {
            it(`Should return 400 and ${rt.invalidFilterQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ filter: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidFilterQuery));
            });
        });
        describe("Given invalid select query", () => {
            it(`Should return 400 ${rt.invalidSelectQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ select: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidSelectQuery));
            });
        });
        describe("Given invalid skip query", () => {
            it(`Should return 400 ${rt.invalidSkipQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ skip: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidSkipQuery));
            });
        });
        describe("Given invalid limit query", () => {
            it(`Should return 400 ${rt.invalidLimitQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ limit: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidLimitQuery));
            });
        });
        describe("Given invalid sort query", () => {
            it(`Should return 400 ${rt.invalidSortQuery}`, async () => {
                const { body, statusCode } = await req.get(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${adminAccessToken}`)
                    .query({ sort: "string-is-not-valid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidSortQuery));
            });
        });
    });
    describe("/{userId}", () => {
        describe("Given valid but non-existing user id", () => {
            it(`Should return 404 and ${rt.userNotFound}`, async () => {
                const userId = utils.generateDbId();
                const accessTokenFake = new User({
                    userId,
                    userType: User.userTypes.Affiliate
                }).createAccessToken();
                const { body, statusCode } = await req.get(`${mainPath}/${userId}`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenFake}`);
                expect(statusCode).toBe(404);
                expect(body).toEqual(createSingleResponse(rt.userNotFound));
            });
        });
        describe("/", () => {
            describe("GET", () => {
                describe("Given valid and existing user id", () => {
                    it("Should return the affiliate with that id", async () => {
                        const { body, statusCode } = await req.get(`${mainPath}/${affiliateA.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual(affiliateA);
                    });
                });
            });
            describe("DELETE", () => {
                describe("Given valid and existing user id", () => {
                    it("Should delete the affiliate", async () => {
                        const { body, statusCode } = await req.delete(`${mainPath}/${affiliateC.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenC}`)
                            .send({ passwordHash });
                        // TODO: /userId DELETE
                        expect(statusCode).toBe(200);
                        expect(body).toEqual(createSingleResponse(rt.success));
                        const { statusCode: statusCode2 } = await req.get(`${mainPath}/${affiliateC.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenC}`);
                        expect(statusCode2).toBe(404);
                    });
                });
                describe("Given invalid password hash", () => {
                    it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                        const { body, statusCode } = await req.delete(`${mainPath}/${affiliateA.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`)
                            .send({ passwordHash: ["invalid"] });
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
                    });
                });
                describe("Given wrong password hash", () => {
                    it(`Should return 401 and ${rt.wrongPasswordHash}`, async () => {
                        const { body, statusCode } = await req.delete(`${mainPath}/${affiliateA.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`)
                            .send({ passwordHash: "wrong" });
                        expect(statusCode).toBe(401);
                        expect(body).toEqual(createSingleResponse(rt.wrongPasswordHash));
                    });
                });
            });
        });
        describe("/children GET", () => {
            beforeAll(async () => {
                const signUpPath = `${mainPath}/sign-up`;
                const verifySignUpPath = `${mainPath}/verify-sign-up`;
                jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);

                const { statusCode: statusCode1, body: body1 } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            ...affiliateE,
                            parentId: affiliateA.userId
                        }
                    );
                expect(statusCode1).toBe(200);
                const { statusCode: statusCode2 } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: body1.verificationToken, verificationCode });
                expect(statusCode2).toBe(200);

                const { statusCode: statusCode3, body: body3 } = await req.post(signUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            ...affiliateF,
                            parentId: affiliateB.userId
                        }
                    );
                expect(statusCode3).toBe(200);
                const { statusCode: statusCode4 } = await req.post(verifySignUpPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ verificationToken: body3.verificationToken, verificationCode });
                expect(statusCode4).toBe(200);
            });
            describe("Given no query", () => {
                it("Should return list of the affiliates children", async () => {
                    const { statusCode, body } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            userId: expect.any(String),
                            fullName: affiliateE.fullName,
                            childrenCount: 0
                        },
                        {
                            userId: affiliateB.userId,
                            fullName: affiliateB.fullName,
                            childrenCount: 1
                        }
                    ]);
                });
            });
            describe("Given query skip=1", () => {
                it("Should return only [affiliateB] as child", async () => {
                    const { statusCode, body } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ skip: 1 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            userId: affiliateB.userId,
                            fullName: affiliateB.fullName,
                            childrenCount: 1
                        }
                    ]);
                });
            });
            describe("Given query limit=1", () => {
                it("Should return only [affiliateE] as child", async () => {
                    const { statusCode, body } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ limit: 1 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            userId: expect.any(String),
                            fullName: affiliateE.fullName,
                            childrenCount: 0
                        }
                    ]);
                });
            });
            describe("Given query sort={childrenCount:-1}", () => {
                it("Should return only [affiliateB, affiliateE] as child", async () => {
                    const { statusCode, body } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ sort: JSON.stringify({ "childrenCount": -1 }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            userId: affiliateB.userId,
                            fullName: affiliateB.fullName,
                            childrenCount: 1
                        },
                        {
                            userId: expect.any(String),
                            fullName: affiliateE.fullName,
                            childrenCount: 0
                        }
                    ]);
                });
            });
            describe("Given invalid skip query", () => {
                it(`Should return 400 ${rt.invalidSkipQuery}`, async () => {
                    const { body, statusCode } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ skip: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSkipQuery));
                });
            });
            describe("Given invalid limit query", () => {
                it(`Should return 400 ${rt.invalidLimitQuery}`, async () => {
                    const { body, statusCode } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ limit: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidLimitQuery));
                });
            });
            describe("Given invalid sort query", () => {
                it(`Should return 400 ${rt.invalidSortQuery}`, async () => {
                    const { body, statusCode } = await req.get(`${mainPath}/${affiliateA.userId}/children`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .query({ sort: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSortQuery));
                });
            });
        });
        describe("/avatar", () => {
            describe("PUT", () => {
                describe("Given valid avatar data", () => {
                    it("Should update the affiliates 'avatar' field and return the new value", async () => {
                        const { body, statusCode } = await req.put(`${mainPath}/${affiliateA.userId}/avatar`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`)
                            .attach("avatar", path.resolve("src", "assets", "images", "sample-image-1.png"));
                        expect(statusCode).toBe(200);
                        expect(body).toEqual({ avatar: expectAvatarImage });

                        const { body: affiliate } = await req.get(`${mainPath}/${affiliateA.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`);
                        expect(affiliate?.avatar).toEqual(body.avatar);

                        const { statusCode: imageStatusCode, text: imageText } = await req.get(affiliate.avatar.path);
                        expect(imageStatusCode).toBe(200);
                        expect(imageText).toBeDefined();

                        affiliateA = affiliate;
                    });
                });
                describe("Given non-image avatar data", () => {
                    it(`Should return 400 and ${rt.invalidFileFormat}`, async () => {
                        const { body, statusCode } = await req.put(`${mainPath}/${affiliateA.userId}/avatar`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`)
                            .attach("avatar", path.resolve("src", "assets", "files", "sample-file.txt"));
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.invalidFileFormat));
                    });
                });
                describe("Given no avatar data", () => {
                    it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                        const { body, statusCode } = await req.put(`${mainPath}/${affiliateA.userId}/avatar`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`);
                        expect(statusCode).toBe(400);
                        expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                    });
                });
            });
            describe("DELETE", () => {
                describe("Given valid and existing user id", () => {
                    it("Should delete the affiliates avatar", async () => {
                        const { body, statusCode } = await req.delete(`${mainPath}/${affiliateA.userId}/avatar`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual(createSingleResponse(rt.success));

                        const { body: affiliate } = await req.get(`${mainPath}/${affiliateA.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessTokenA}`);
                        expect(affiliate.avatar).toBeUndefined();

                        const { statusCode: imageStatusCode } = await req.get(affiliateA.avatar.path);
                        expect(imageStatusCode).toBe(404);

                        affiliateA = affiliate;
                    });
                });
            });
        });
        describe("/password", () => {
            describe("Given valid old and new password hash", () => {
                it("Should update the affiliates password hash", async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/password`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                oldPasswordHash: passwordHash,
                                newPasswordHash
                            }
                        );
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));

                    const { statusCode: statusCodeSignIn1 } = await req.post(`${mainPath}/sign-in`)
                        .set("Api-Key", env.API_KEY)
                        .send({ phoneOrEmail: affiliateA.email, passwordHash });
                    expect(statusCodeSignIn1).toBe(401);

                    const { statusCode: statusCodeSignIn2 } = await req.post(`${mainPath}/sign-in`)
                        .set("Api-Key", env.API_KEY)
                        .send({ phoneOrEmail: affiliateA.email, passwordHash: newPasswordHash });
                    expect(statusCodeSignIn2).toBe(200);
                });
            });
            describe("Given invalid old password hash and valid new password hash", () => {
                it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/password`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                oldPasswordHash: ["invalid"],
                                newPasswordHash
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
                });
            });
            describe("Given valid old password hash and invalid new password hash", () => {
                it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/password`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                oldPasswordHash: passwordHash,
                                newPasswordHash: ["invalid"]
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
                });
            });
            describe("Given wrong old password hash", () => {
                it(`Should return 400 and ${rt.wrongPasswordHash}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/password`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                oldPasswordHash: "wrong",
                                newPasswordHash
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.wrongPasswordHash));
                });
            });
        });
        describe("/phone", () => {
            describe("Given valid phone", () => {
                it("Should update the affiliates phone", async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/phone`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newPhone
                            }
                        );
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));

                    const { body: affiliate } = await req.get(`${mainPath}/${affiliateA.userId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`);
                    expect(affiliate.phone).toBe(newPhone);

                    affiliateA = affiliate;
                });
            });
            describe("Given invalid phone", () => {
                it(`Should return 400 and ${rt.invalidPhone}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/phone`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newPhone: "invalid"
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidPhone));
                });
            });
            describe("Given existing phone", () => {
                it(`Should return 409 and ${rt.affiliatePhoneAlreadyExist}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/phone`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newPhone: affiliateB.phone
                            }
                        );
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.affiliatePhoneAlreadyExist));
                });
            });
        });
        describe("/full-name", () => {
            describe("Given valid full name", () => {
                it("Should update the affiliates full name", async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/full-name`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newFullName
                            }
                        );
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));

                    const { body: affiliate } = await req.get(`${mainPath}/${affiliateA.userId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`);
                    expect(affiliate.fullName).toBe(newFullName);

                    affiliateA = affiliate;
                });
            });
            describe("Given invalid full name", () => {
                it(`Should return 400 and ${rt.invalidFullName}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/full-name`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newFullName: ["invalid"]
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidFullName));
                });
            });
        });
        describe("/email", () => {
            describe("Given valid new email", () => {
                it("Should send verification email to the new email and return verification token", async () => {
                    const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                    const createVerificationCodeMock = jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/email`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newEmail
                            }
                        );
                    expect(createVerificationCodeMock).toHaveBeenCalledTimes(1);
                    expect(sendEmailMock).toHaveBeenCalledTimes(1);
                    expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.emailVerification, html: emailVerificationEmailHtml, to: newEmail });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({ verificationToken: expect.any(String) });

                    emailVerificationToken = body.verificationToken;
                });
            });
            describe("Given invalid new email", () => {
                it(`Should return 400 and ${rt.invalidEmail}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/email`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newEmail: "invalid"
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidEmail));
                });
            });
            describe("Given existing new email", () => {
                it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {
                    const { body, statusCode } = await req.patch(`${mainPath}/${affiliateA.userId}/email`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessTokenA}`)
                        .send(
                            {
                                newEmail: affiliateB.email
                            }
                        );
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.affiliateEmailAlreadyExist));
                });
            });
        });
    }
    );
    describe("/verify-email", () => {
        describe("Given valid verification token and code", () => {
            it("Should update the affiliates email", async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken: emailVerificationToken,
                            verificationCode
                        }
                    );
                expect(statusCode).toBe(200);
                expect(body).toEqual(createSingleResponse(rt.success));

                const { body: affiliate } = await req.get(`${mainPath}/${affiliateA.userId}`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`);
                expect(affiliate.email).toBe(newEmail);

                affiliateA = affiliate;
            });
        });
        describe("Given invalid verification token", () => {
            it(`Should return 400 and ${rt.invalidToken}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken: "invalid",
                            verificationCode
                        }
                    );
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidToken));
            });
        });
        describe("Given invalid verification code", () => {
            it(`Should return 400 and ${rt.invalidVerificationCode}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken: emailVerificationTokenFake,
                            verificationCode: ["invalid"]
                        }
                    );
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidVerificationCode));
            });
        });
        describe("Given wrong verification code", () => {
            it(`Should return 401 and ${rt.wrongVerificationCode}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken: emailVerificationTokenFake,
                            verificationCode: "wrong"
                        }
                    );
                expect(statusCode).toBe(401);
                expect(body).toEqual(createSingleResponse(rt.wrongVerificationCode));
            });
        });
        describe("Given expired verification token", () => {
            it(`Should return 408 and ${rt.expiredToken}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken: emailVerificationTokenExpired,
                            verificationCode
                        }
                    );
                expect(statusCode).toBe(408);
                expect(body).toEqual(createSingleResponse(rt.expiredToken));
            });
        });
        describe("Given existing new email", () => {
            it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {
                const verificationToken = utils.encrypt(JSON.stringify(
                    {
                        userId: affiliateA.userId,
                        email: affiliateB.email,
                        verificationCode,
                        validUntil: new Date().getTime() + (60 * 60 * 1000)
                    }
                ));
                const { body, statusCode } = await req.patch(`${mainPath}/verify-email`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessTokenA}`)
                    .send(
                        {
                            verificationToken,
                            verificationCode
                        }
                    );
                expect(statusCode).toBe(409);
                expect(body).toEqual(createSingleResponse(rt.affiliateEmailAlreadyExist));
            });
        });
    });
    describe("/forgot-password", () => {
        describe("Given valid and existing email", () => {
            it("Should send verification link to the given email", async () => {
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const { body, statusCode } = await req.patch(`${mainPath}/forgot-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            email: affiliateA.email
                        }
                    );
                expect(statusCode).toBe(200);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.passwordRecovery, html: expect.any(String), to: newEmail });
                expect(body).toEqual(createSingleResponse(rt.success));
            });
        });
        describe("Given invalid email", () => {
            it(`Should return 400 and ${rt.invalidEmail}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/forgot-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            email: "invalid"
                        }
                    );
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidEmail));
            });
        });
        describe("Given valid but non-existing email", () => {
            it(`Should return 404 and ${rt.userNotFound}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/forgot-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            email: "non.existing@mail.com"
                        }
                    );
                expect(statusCode).toBe(404);
                expect(body).toEqual(createSingleResponse(rt.userNotFound));
            });
        });
    });
    describe("/recover-password", () => {
        describe("Given valid token and password hash", () => {
            it("Should update the affiliates password hash", async () => {
                const recoveryToken = utils.encrypt(JSON.stringify(
                    {
                        userId: affiliateA.userId,
                        validUntil: new Date().getTime() + (60 * 60 * 1000)
                    }
                ));
                const { body, statusCode } = await req.patch(`${mainPath}/recover-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            recoveryToken,
                            newPasswordHash: newPasswordHash2
                        }
                    );
                expect(statusCode).toBe(200);
                expect(body).toEqual(createSingleResponse(rt.success));

                const { statusCode: statusCodeSignIn1 } = await req.post(`${mainPath}/sign-in`)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.email, passwordHash: newPasswordHash });
                expect(statusCodeSignIn1).toBe(401);

                const { statusCode: statusCodeSignIn2 } = await req.post(`${mainPath}/sign-in`)
                    .set("Api-Key", env.API_KEY)
                    .send({ phoneOrEmail: affiliateA.email, passwordHash: newPasswordHash2 });
                expect(statusCodeSignIn2).toBe(200);
            });
        });
        describe("Given invalid token", () => {
            it(`Should return 400 and ${rt.invalidToken}`, async () => {
                const { body, statusCode } = await req.patch(`${mainPath}/recover-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            recoveryToken: "invalid",
                            newPasswordHash: newPasswordHash2
                        }
                    );
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidToken));
            });
        });
        describe("Given invalid password hash", () => {
            it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {
                const recoveryToken = utils.encrypt(JSON.stringify(
                    {
                        userId: affiliateA.userId,
                        validUntil: new Date().getTime() + (60 * 60 * 1000)
                    }
                ));
                const { body, statusCode } = await req.patch(`${mainPath}/recover-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            recoveryToken,
                            newPasswordHash: ["invalid"]
                        }
                    );
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPasswordHash));
            });
        });
        describe("Given expired verification token", () => {
            it(`Should return 408 and ${rt.expiredToken}`, async () => {
                const recoveryToken = utils.encrypt(JSON.stringify(
                    {
                        userId: affiliateA.userId,
                        validUntil: 0
                    }
                ));
                const { body, statusCode } = await req.patch(`${mainPath}/recover-password`)
                    .set("Api-Key", env.API_KEY)
                    .send(
                        {
                            recoveryToken,
                            newPasswordHash: newPasswordHash2
                        }
                    );
                expect(statusCode).toBe(408);
                expect(body).toEqual(createSingleResponse(rt.expiredToken));
            });
        });
    });
});