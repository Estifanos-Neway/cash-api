const supertest = require("supertest");
const regexpEscape = require("regexp.escape");
const { makeApp } = require("../../app");
const utils = require("../../commons/functions");
const rt = require("../../commons/response-texts");
const { env } = require("../../env");
const testUtils = require("./test.utils");
const emailSubjects = require("../../assets/emails/email-subjects.json");
const config = require("../../configs");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");

const mainPath = "/contact-us";
describe(mainPath, () => {
    testUtils.setJestTimeout();
    const contactUsForm = {
        fullName: "Full Name",
        phone: "+251987654321",
        email: "email@gmail.com",
        address: "My home city",
        message: "A longer message here."
    };
    let req;

    beforeEach(async () => {
        req = supertest(makeApp());
    });

    describe("POST", () => {
        describe("Given valid inputs", () => {
            it("Should send a contact-us email", async () => {
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const { statusCode } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send(contactUsForm);
                const { fullName, phone, email, address, message } = contactUsForm;
                expect(statusCode).toBe(200);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringMatching(new RegExp(`(?=${regexpEscape(fullName)})`)), to: config.contactUsEmailTo });
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringMatching(new RegExp(`(?=${regexpEscape(phone)})`)), to: config.contactUsEmailTo });
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringMatching(new RegExp(`(?=${regexpEscape(email)})`)), to: config.contactUsEmailTo });
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringMatching(new RegExp(`(?=${regexpEscape(address)})`)), to: config.contactUsEmailTo });
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringMatching(new RegExp(`(?=${regexpEscape(message)})`)), to: config.contactUsEmailTo });
            });
        });
        describe("Given required fields only", () => {
            it("Should send a contact-us email", async () => {
                const sendEmailMock = jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
                const { statusCode } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ message: contactUsForm.message });
                expect(statusCode).toBe(200);
                expect(sendEmailMock).toHaveBeenCalledTimes(1);
                expect(sendEmailMock).toHaveBeenCalledWith({ subject: emailSubjects.contactUs, html: expect.stringContaining(contactUsForm.message), to: config.contactUsEmailTo });
            });
        });
        describe("Given invalid fullName", () => {
            it(`Should return 400 and ${rt.invalidFullName}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, fullName: ["invalid"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidFullName));
            });
        });
        describe("Given invalid phone", () => {
            it(`Should return 400 and ${rt.invalidPhone}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, phone: "0987654" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidPhone));
            });
        });
        describe("Given invalid email", () => {
            it(`Should return 400 and ${rt.invalidEmail}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, email: "invalid" });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidEmail));
            });
        });
        describe("Given invalid address", () => {
            it(`Should return 400 and ${rt.invalidAddress}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, address: ["invalid"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidAddress));
            });
        });
        describe("Given invalid message", () => {
            it(`Should return 400 and ${rt.invalidMessage}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, message: ["invalid"] });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidMessage));
            });
        });
        describe("Given no message", () => {
            it(`Should return 400 and ${rt.invalidMessage}`, async () => {
                const { statusCode, body } = await req.post(mainPath)
                    .set("Api-Key", env.API_KEY)
                    .send({ ...contactUsForm, message: undefined });
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidMessage));
            });
        });
    });
});