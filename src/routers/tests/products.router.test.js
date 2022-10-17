const path = require("path");
const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../config.json");
const { hash } = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const {
    invalidJsonStringResponseText,
    invalidInputResponseText,
    productNameAlreadyExistResponseText,
    requiredParamsNotFoundResponseText,
    invalidSearchQueryResponseText,
    invalidFilterQueryResponseText,
    invalidCategoriesQueryResponseText,
    invalidSelectQueryResponseText,
    invalidSkipQueryResponseText,
    invalidSortQueryResponseText,
    invalidLimitQueryResponseText,
    productNotFoundResponseText, } = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");


describe("/products", () => {
    const mainPath = "/products";

    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    let productA = {
        productId: undefined,
        productName: "Product-A",
        price: 200,
        commissionRate: 25
    };
    let productB = {
        productId: undefined,
        productName: "Product-B",
        description: "Cool machine.",
        price: 200,
        commissionRate: 25,
        categories: ["Small", "White"],
        featured: true,
        published: true,
        viewCount: 220
    };
    const imageData = { path: expect.stringMatching(/^\/images\/products\/.+$/) };
    const today = new Date().toISOString().split("T")[0];
    const dateData = expect.stringMatching(`^${today}T.+$`);
    let request, accessToken;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
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

    afterAll(() => {
        mongoose.connection.db.dropDatabase();
    });

    describe("/", () => {
        describe("POST", () => {
            describe("Given all the required fields", () => {
                it("Should add the product", async () => {
                    const { body: bodyA, statusCode: statusCodeA } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify(productA));
                    const { body: bodyB, statusCode: statusCodeB } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify(productB))
                        .attach("mainImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                        .attach("moreImages", path.resolve("src", "assets", "images", "sample-image-1.png"))
                        .attach("moreImages", path.resolve("src", "assets", "images", "sample-image-2.jpg"))
                        .attach("moreImages", path.resolve("src", "assets", "files", "sample-file.txt"));

                    expect(statusCodeA).toBe(200);
                    expect(statusCodeB).toBe(200);
                    expect(bodyA).toEqual({
                        ...productA,
                        productId: expect.any(String),
                        moreImages: [],
                        categories: [],
                        featured: false,
                        published: false,
                        viewCount: 0,
                        createdAt: dateData,
                        updatedAt: dateData,
                    });
                    expect(bodyB).toEqual({
                        ...productB,
                        productId: expect.any(String),
                        mainImage: imageData,
                        moreImages: [imageData, imageData],
                        createdAt: dateData,
                        updatedAt: dateData,
                    });

                    productA = bodyA;
                    productB = bodyB;
                });
            });
            describe("Given invalid json string", () => {
                it(`Should return 400 and ${invalidJsonStringResponseText}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", "invalid-json");
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidJsonStringResponseText));
                });
            });
            describe("Given invalid input (ex: non-number price)", () => {
                it(`Should return 400 and ${invalidInputResponseText}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ ...productA, price: "200" }));
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidInputResponseText));
                });
            });
            describe("Given missing required field (ex: no commission rate)", () => {
                it(`Should return 400 and ${requiredParamsNotFoundResponseText}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ ...productA, productName: "Non-Existing-Name", commissionRate: undefined }));
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(requiredParamsNotFoundResponseText));
                });
            });
            describe("Given existing product name", () => {
                it(`Should return 409 and ${productNameAlreadyExistResponseText}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify(productA));
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(productNameAlreadyExistResponseText));
                });
            });
        });
        describe("GET", () => {
            describe("Given no params", () => {
                it("Should return list of products", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productB, productA]);
                });
            });
            describe("Given query filter={productName:'Product-b'}", () => {
                it("Should return []", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ filter: JSON.stringify({ productName: "Product-b" }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([]);
                });
            });
            describe("Given query filter={productName:'Product-B'}", () => {
                it("Should return [productB]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ filter: JSON.stringify({ productName: productB.productName }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productB]);
                });
            });
            describe("Given query search={productName:'^product'}", () => {
                it("Should return [productA,productB]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ search: JSON.stringify({ productName: "^product" }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productB, productA]);
                });
            });
            describe("Given query categories=['Small']", () => {
                it("Should return [productB]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ categories: JSON.stringify(["Small"]) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productB]);
                });
            });
            describe("Given query limit=1", () => {
                it("Should return [productB]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ limit: 1 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productB]);
                });
            });
            describe("Given query skip=1", () => {
                it("Should return [productA]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ skip: 1 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productA]);
                });
            });
            describe("Given query select=['productName']", () => {
                it("Should return products with product name only", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ select: JSON.stringify(["productName"]) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            productId: productB.productId,
                            productName: productB.productName,
                        },
                        {
                            productId: productA.productId,
                            productName: productA.productName,
                        }
                    ]);
                });
            });
            describe("Given query sort={viewCount: 1}", () => {
                it("Should return [productA, productB]", async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ sort: JSON.stringify({ "viewCount": 1 }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([productA, productB]);
                });
            });
            describe("Given invalid search query", () => {
                it(`Should return 400 ${invalidSearchQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ search: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidSearchQueryResponseText));
                });
            });
            describe("Given invalid filter query", () => {
                it(`Should return 400 ${invalidFilterQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ filter: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidFilterQueryResponseText));
                });
            });
            describe("Given invalid categories query", () => {
                it(`Should return 400 ${invalidCategoriesQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ categories: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidCategoriesQueryResponseText));
                });
            });
            describe("Given invalid select query", () => {
                it(`Should return 400 ${invalidSelectQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ select: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidSelectQueryResponseText));
                });
            });
            describe("Given invalid skip query", () => {
                it(`Should return 400 ${invalidSkipQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ skip: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidSkipQueryResponseText));
                });
            });
            describe("Given invalid limit query", () => {
                it(`Should return 400 ${invalidLimitQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ limit: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidLimitQueryResponseText));
                });
            });
            describe("Given invalid sort query", () => {
                it(`Should return 400 ${invalidSortQueryResponseText}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ sort: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(invalidSortQueryResponseText));
                });
            });
        });
    });
    describe("/{productId}", () => {
        describe("GET", () => {
            describe("Given valid product name", () => {
                it("Should return a single product", async () => {

                });
            });
            describe("Given invalid product name", () => {
                it(`Should return 404 and ${productNotFoundResponseText}`, async () => {

                });
            });
        });
        describe("PATCH", () => {
            describe("Given valid updates", () => {
                it("Should update the product", async () => {

                });
            });
        });
        describe("DELETE", () => {
        });
    });
});