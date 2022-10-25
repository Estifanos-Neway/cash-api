const mongoose = require("mongoose");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const utils = require("../../commons/functions");
const { hash, encrypt } = require("../../commons/functions");
const rt = require("../../commons/response-texts");
const { verificationTokenExpiresIn } = require("../../commons/variables");
const { defaultAdmin } = require("../../config.json");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");

describe("/affiliates", () => {
    const mainPath = "/affiliates";
    const newEmail = "estifanos.neway.d@gmail.com";
    let emailVerificationCode = "VCODE";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    let request, adminAccessToken, emailVerificationToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        await adminsRepo.signUp(adminCredentials);
        request = supertest(makeApp());
        // @ts-ignore
        const { body } = await request.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send(adminCredentials);
        adminAccessToken = body.accessToken;
    });

    beforeEach(() => {
        request = supertest(makeApp());
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("/sign-up and /verify-sign-up POST", () => {
        describe("[/sign-up] Given valid affiliate data", () => {
            it("Should send verification email and return verification token", async () => {

            });
        });
        describe("[/verify-sign-up] Given valid verification data", () => {
            it("Should sign up and sin in the affiliate and return sign in data", async () => {

            });
        });
        describe("[/sign-up] Given valid affiliate data [with parent id]", () => {
            it("Should send verification email and return verification token", async () => {

            });
        });
        describe("[/verify-sign-up] Given valid verification data [with parent id]", () => {
            it("Should sign up and sin in the affiliate and return sign in data [with parent id]", async () => {

            });
        });
        describe("[/sign-up] Given valid affiliate data [with valid but non-existing parent id]", () => {
            it("Should send verification email and return verification token", async () => {

            });
        });
        describe("[/verify-sign-up] Given valid verification data [with valid but non-existing parent id]", () => {
            it("Should sign up and sin in the affiliate [with no parent id] and return sign in data", async () => {

            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidFullName}`, async () => {

            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidPhone}`, async () => {

            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidEmail}`, async () => {

            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {

            });
        });
        describe("[/sign-up] Given invalid full name", () => {
            it(`Should return 400 and ${rt.invalidParentId}`, async () => {

            });
        });
        describe("[/sign-up] Given existing email", () => {
            it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {

            });
        });
        describe("[/sign-up] Given existing phone", () => {
            it(`Should return 409 and ${rt.affiliatePhoneAlreadyExist}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given invalid verification token", () => {
            it(`Should return 400 and ${rt.invalidToken}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given invalid verification code", () => {
            it(`Should return 400 and ${rt.invalidVerificationCode}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given wrong verification code", () => {
            it(`Should return 401 and ${rt.wrongVerificationCode}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given expired verification token", () => {
            it(`Should return 408 and ${rt.expiredToken}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given existing email", () => {
            it(`Should return 409 and ${rt.affiliateEmailAlreadyExist}`, async () => {

            });
        });
        describe("[/verify-sign-up] Given existing phone", () => {
            it(`Should return 409 and ${rt.affiliatePhoneAlreadyExist}`, async () => {

            });
        });
    });
    describe("/sign-in POST", () => {
        describe("Given valid affiliate credentials [email]", () => {
            it("Should return affiliate sign in data", async () => {

            });
        });
        describe("Given valid affiliate credentials [phone]", () => {
            it("Should return affiliate sign in data", async () => {

            });
        });
        describe("Given invalid phoneOrEmail", () => {
            it(`Should return 400 and ${rt.invalidPhoneOrEmail}`, async () => {

            });
        });
        describe("Given invalid passwordHash", () => {
            it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {

            });
        });
        describe("Given valid phone or email and wrong passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {

            });
        });
        describe("Given wrong phone or email and valid passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {

            });
        });
        describe("Given wrong phone or email and wrong passwordHash", () => {
            it(`Should return 401 and ${rt.wrongCredentials}`, async () => {

            });
        });
    });
    describe("/ GET", () => {

    });
    describe("/{userId}", () => {
        describe("GET", () => {
            describe("Given valid and existing user id", () => {
                it("Should return the affiliate with that id", async () => {

                });
            });
            describe("Given invalid user id", () => {
                it(`Should return 400 and ${rt.invalidUserId}`, async () => {

                });
            });
            describe("Given valid but non-existing user id", () => {
                it(`Should return 404 and ${rt.userNotFound}`, async () => {

                });
            });
        });
        describe("DELETE", () => {
            describe("Given valid and existing user id", () => {
                it("Should return the affiliate with that id", async () => {

                });
            });
            describe("Given invalid user id", () => {
                it(`Should return 400 and ${rt.invalidUserId}`, async () => {

                });
            });
            describe("Given invalid password hash", () => {
                it(`Should return 400 and ${rt.invalidPasswordHash}`, async () => {

                });
            });
            describe("Given wrong password hash", () => {
                it(`Should return 401 and ${rt.wrongPasswordHash}`, async () => {

                });
            });
            describe("Given valid but non-existing user id", () => {
                it(`Should return 404 and ${rt.userNotFound}`, async () => {

                });
            });
        });
    });
});