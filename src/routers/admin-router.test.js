const { createHash } = require("crypto");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
const { adminRouter, tokensRouter } = require(".");
const { makeApp } = require("../app");
const { defaultPort } = require("../commons/variables");
const { defaultAdmin } = require("../config.json");
const { env } = require("../env");
const { signUpAdminRepo } = require("../repositories/admin");

describe("/admin", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { keepAlive: true });

        const passwordHash = createHash("sha256").update(defaultAdmin.password).digest("hex");
        await signUpAdminRepo({ username: defaultAdmin.username, passwordHash });
    });

    let request;
    beforeEach(() => {
        request = supertest(makeApp(defaultPort, adminRouter, tokensRouter))
            .set("Api-Key", env.API_KEY);
    });

    describe("/sign-in POST", () => {
        describe("Given valid username and passwordHash", () => {
            it("Should success.", () => {
                
                expect(true).toBe(true);
            });
        });
    });

    describe("/ GET", () => {
        describe("Given valid username and passwordHash", () => {
            it("Should success.", () => {
                expect(true).toBe(true);
            });
        });
    });
});