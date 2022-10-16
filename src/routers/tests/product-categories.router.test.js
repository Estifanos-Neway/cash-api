const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../config.json");
const { hash } = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const { invalidInputResponseText, requiredParamsNotFoundResponseText, categoryNameAlreadyExistResponseText, categoryNotFoundResponseText } = require("../../commons/response-texts");
const adminCredentials = {
    username: defaultAdmin.username,
    passwordHash: hash(defaultAdmin.password)
};

describe("/product-categories", () => {
    const mainPath = "/product-categories";
    const category = {
        categoryId: undefined,
        categoryName: "Category-A"
    };
    let request, accessToken;

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
    });

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("/", () => {
        const subPath = `${mainPath}/`;
        describe("POST", () => {
            describe("Given valid category name", () => {
                it("Should successfully add to categories", async () => {
                    const { body, statusCode } = await request.post(subPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(category);

                    expect(statusCode).toBe(200);
                    expect(body).toHaveProperty("categoryId", expect.any(String));
                    expect(body).toHaveProperty("categoryName", category.categoryName);
                    category.categoryId = body.categoryId;
                });
            });
            describe("Given invalid category name", () => {
                it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                    const { body, statusCode } = await request.post(subPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ ...category, categoryName: ["invalid"] });
                    expect(statusCode).toBe(400);
                    expect(body).toHaveProperty("message", invalidInputResponseText);
                });
            });
            describe("Given no category name", () => {
                it(`Should return 400 and ${requiredParamsNotFoundResponseText}`, async () => {
                    const { body, statusCode } = await request.post(subPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);

                    expect(statusCode).toBe(400);
                    expect(body).toHaveProperty("message", requiredParamsNotFoundResponseText);
                });
            });
            describe("Given duplicated category name", () => {
                it(`Should return 409 and ${categoryNameAlreadyExistResponseText}`, async () => {
                    const { body, statusCode } = await request.post(subPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send(category);

                    expect(statusCode).toBe(409);
                    expect(body).toHaveProperty("message", categoryNameAlreadyExistResponseText);
                });
            });
        });
        describe("GET", () => {
            it("Should return list of categories", async () => {
                const { body, statusCode } = await request.get(subPath)
                    .set("Api-Key", env.API_KEY);
                expect(statusCode).toBe(200);
                expect(body).toEqual([category]);
            });
        });
    });
    describe("/{categoryId}", () => {
        describe("PATCH", () => {
            const categoryNameEdited = "Category-A:Edited";
            const otherCategoryName = "Category-B";
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
                    expect(categoryList).toEqual([{ ...category, categoryName: categoryNameEdited }]);
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
                    expect(categoryList).toEqual([category]);
                });
            });
            describe("Given invalid new category name", () => {
                it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: ["invalid"] });
                    expect(statusCode).toBe(400);
                    expect(body).toHaveProperty("message", invalidInputResponseText);
                });
            });
            describe("Given invalid category id", () => {
                it(`Should return 404 and ${categoryNotFoundResponseText}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/invalid`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: "valid-category-name" });
                    expect(statusCode).toBe(404);
                    expect(body).toHaveProperty("message", categoryNotFoundResponseText);
                });
            });
            describe("Given existing category name", () => {
                it(`Should return 409 and ${categoryNameAlreadyExistResponseText}`, async () => {
                    const { statusCode:postStatusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: otherCategoryName });
                    expect(postStatusCode).toBe(200);
                    const { body, statusCode } = await request.patch(`${mainPath}/${category.categoryId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .send({ categoryName: otherCategoryName });
                    expect(statusCode).toBe(409);
                    expect(body).toHaveProperty("message", categoryNameAlreadyExistResponseText);
                });
            });
        });
        // describe("DELETE",()=>{

        // });
    });
});