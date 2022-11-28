const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../configs");
const utils = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const testUtils = require("./test.utils");

describe("/product-categories", () => {
    testUtils.setJestTimeout();
    jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
    const mainPath = "/product-categories";
    const category = {
        categoryId: undefined,
        categoryName: "Category-A"
    };
    const anotherCategory = {
        categoryId: undefined,
        categoryName: "Category-B"
    };
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: utils.hash(defaultAdmin.password)
    };
    let request, accessToken;

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
        accessToken = body.accessToken;
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

    describe("/", () => {
        describe("POST", () => {
            describe("Given valid category name", () => {
                it("Should successfully add to categories", async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(category);
                    const { body: anotherBody, statusCode: anotherStatusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(anotherCategory);

                    expect(statusCode).toBe(200);
                    expect(anotherStatusCode).toBe(200);
                    expect(body).toEqual({ ...category, categoryId: expect.any(String) });
                    expect(anotherBody).toEqual({ ...anotherCategory, categoryId: expect.any(String) });
                    category.categoryId = body.categoryId;
                    anotherCategory.categoryId = anotherBody.categoryId;
                });
            });
            describe("Given invalid category name", () => {
                it(`Should return 400 and ${rt.invalidInput}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ ...category, categoryName: ["invalid"] });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidInput));
                });
            });
            describe("Given no category name", () => {
                it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);

                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                });
            });
            describe("Given duplicated category name", () => {
                it(`Should return 409 and ${rt.categoryNameAlreadyExist}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(category);

                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.categoryNameAlreadyExist));
                });
            });
        });
        describe("GET", () => {
            it("Should return list of categories", async () => {
                const { body, statusCode } = await request.get(mainPath)
                    .set("Api-Key", env.API_KEY);
                expect(statusCode).toBe(200);
                expect(body).toEqual([category, anotherCategory]);
            });
        });
    });
    describe("/{categoryId}", () => {
        describe("PATCH", () => {
            const categoryNameEdited = "Category-A:Edited";
            describe("Given valid category id and new category name", () => {
                it("Should update the category", async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: categoryNameEdited });
                    const { body: categoryList } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({ ...category, categoryName: categoryNameEdited });
                    expect(categoryList).toEqual([{ ...category, categoryName: categoryNameEdited }, anotherCategory]);
                    category.categoryName = body.categoryName;
                });
            });
            describe("Given unchanged category name", () => {
                it("Should not break", async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: category.categoryName });
                    const { body: categoryList } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({ ...category, categoryName: categoryNameEdited });
                    expect(categoryList).toEqual([category, anotherCategory]);
                });
            });
            describe("Given invalid new category name", () => {
                it(`Should return 400 and ${rt.invalidInput}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: ["invalid"] });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidInput));
                });
            });
            describe("Given invalid category id", () => {
                it(`Should return 404 and ${rt.categoryNotFound}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/invalid`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: "valid-category-name" });
                    expect(statusCode).toBe(404);
                    expect(body).toEqual(createSingleResponse(rt.categoryNotFound));
                });
            });
            describe("Given existing category name", () => {
                it(`Should return 409 and ${rt.categoryNameAlreadyExist}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: anotherCategory.categoryName });
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.categoryNameAlreadyExist));
                });
            });
        });
        describe("DELETE", () => {
            describe("Given valid category id", () => {
                it("Should delete the category", async () => {
                    const { body, statusCode } = await request.delete(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));
                });
            });
            describe("Given non-existing category id", () => {
                it(`Should return 404 and ${rt.categoryNotFound}`, async () => {
                    const { body, statusCode } = await request.delete(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(404);
                    expect(body).toEqual(createSingleResponse(rt.categoryNotFound));
                });
            });
        });
    });
});