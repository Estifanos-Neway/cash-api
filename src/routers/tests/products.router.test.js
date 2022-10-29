const path = require("path");
const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../config.json");
const { hash } = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const testUtils = require("./test.utils");

describe("/products", () => {
    testUtils.setJestTimeout();
    const mainPath = "/products";

    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: hash(defaultAdmin.password)
    };
    let productA = {
        productId: undefined,
        productName: "Product-A",
        price: 200,
        commission: 25
    };
    let productB = {
        productId: undefined,
        productName: "Product-B",
        description: "Cool machine.",
        price: 200,
        commission: 25,
        categories: ["Small", "White"],
        published: true,
        featured: true,
        topSeller: true,
        viewCount: 220
    };
    const expectProductImage = { path: expect.stringMatching(/^\/images\/products\/.+$/) };
    const today = new Date().toISOString().split("T")[0];
    const expectToday = expect.stringMatching(`^${today}T.+$`);
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

    afterAll(async () => {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
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
                        published: false,
                        featured: false,
                        topSeller: false,
                        viewCount: 0,
                        createdAt: expectToday,
                        updatedAt: expectToday,
                    });
                    expect(bodyB).toEqual({
                        ...productB,
                        productId: expect.any(String),
                        mainImage: expectProductImage,
                        moreImages: [expectProductImage, expectProductImage],
                        createdAt: expectToday,
                        updatedAt: expectToday,
                    });
                    const { statusCode: imageStatusCode1, text: imageText1 } = await request.get(bodyB.mainImage.path);
                    expect(imageStatusCode1).toBe(200);
                    expect(imageText1).toBeDefined();
                    const { statusCode: imageStatusCode2, text: imageText2 } = await request.get(bodyB.moreImages[0].path);
                    expect(imageStatusCode2).toBe(200);
                    expect(imageText2).toBeDefined();
                    const { statusCode: imageStatusCode3, text: imageText3 } = await request.get(bodyB.moreImages[1].path);
                    expect(imageStatusCode3).toBe(200);
                    expect(imageText3).toBeDefined();

                    productA = bodyA;
                    productB = bodyB;
                });
            });
            describe("Given invalid json productDetails", () => {
                it(`Should return 400 and ${rt.invalidJsonString}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", "invalid-json");
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidJsonString));
                });
            });
            describe("Given invalid input (ex: non-number price)", () => {
                it(`Should return 400 and ${rt.invalidInput}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ ...productA, price: "200" }));
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidInput));
                });
            });
            describe("Given missing required field (ex: no commission rate)", () => {
                it(`Should return 400 and ${rt.requiredParamsNotFound}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ ...productA, productName: "Non-Existing-Name", commission: undefined }));
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                });
            });
            describe("Given existing product name", () => {
                it(`Should return 409 and ${rt.productNameAlreadyExist}`, async () => {
                    const { body, statusCode } = await request.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify(productA));
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.productNameAlreadyExist));
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
                it(`Should return 400 and ${rt.invalidSearchQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ search: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSearchQuery));
                });
            });
            describe("Given invalid filter query", () => {
                it(`Should return 400 and ${rt.invalidFilterQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ filter: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidFilterQuery));
                });
            });
            describe("Given invalid categories query", () => {
                it(`Should return 400 ${rt.invalidCategoriesQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ categories: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidCategoriesQuery));
                });
            });
            describe("Given invalid select query", () => {
                it(`Should return 400 ${rt.invalidSelectQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ select: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSelectQuery));
                });
            });
            describe("Given invalid skip query", () => {
                it(`Should return 400 ${rt.invalidSkipQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ skip: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSkipQuery));
                });
            });
            describe("Given invalid limit query", () => {
                it(`Should return 400 ${rt.invalidLimitQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ limit: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidLimitQuery));
                });
            });
            describe("Given invalid sort query", () => {
                it(`Should return 400 ${rt.invalidSortQuery}`, async () => {
                    const { body, statusCode } = await request.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .query({ sort: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSortQuery));
                });
            });
        });
    });
    describe("/{productId}", () => {
        describe("GET", () => {
            describe("Given valid product id", () => {
                it("Should return a single product", async () => {
                    const { body: bodyA, statusCode: statusCodeA } = await request.get(`${mainPath}/${productA.productId}`)
                        .set("Api-Key", env.API_KEY);
                    const { body: bodyB, statusCode: statusCodeB } = await request.get(`${mainPath}/${productB.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);

                    expect(statusCodeA).toBe(200);
                    expect(bodyA).toEqual(
                        {
                            ...productA,
                            viewCount: productA.viewCount + 1,
                            updatedAt: expectToday
                        }
                    );
                    expect(statusCodeB).toBe(200);
                    expect(bodyB).toEqual(
                        {
                            ...productB,
                            updatedAt: expectToday
                        }
                    );
                    productA = bodyA;
                    productB = bodyB;
                });
            });
            describe("Given invalid product id", () => {
                it(`Should return 404 and ${rt.productNotFound}`, async () => {
                    const { body: bodyA, statusCode: statusCodeA } = await request.get(`${mainPath}/invalid-product-id`)
                        .set("Api-Key", env.API_KEY);

                    expect(statusCodeA).toBe(404);
                    expect(bodyA).toEqual(createSingleResponse(rt.productNotFound));
                });
            });
        });
        describe("PATCH", () => {
            describe("Given valid updates", () => {
                it("Should update the product", async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${productA.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify(
                            {
                                productName: "Product-A-Updated",
                                description: "New description",
                                price: productA.price + 100,
                                commission: 80,
                                categories: ["Big", "Blue"],
                                published: true,
                                featured: true,
                                topSeller: true,
                                viewCount: productA.viewCount + 200
                            }
                        ))
                        .attach("mainImage", path.resolve("src", "assets", "images", "sample-image-1.png"))
                        .attach("moreImages", path.resolve("src", "assets", "images", "sample-image-1.png"))
                        .attach("moreImages", path.resolve("src", "assets", "images", "sample-image-2.jpg"))
                        .attach("moreImages", path.resolve("src", "assets", "files", "sample-file.txt"));
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({
                        ...productA,
                        productName: "Product-A-Updated",
                        description: "New description",
                        price: productA.price + 100,
                        commission: 80,
                        categories: ["Big", "Blue"],
                        mainImage: expectProductImage,
                        moreImages: [expectProductImage, expectProductImage],
                        published: true,
                        featured: true,
                        topSeller: true,
                        viewCount: productA.viewCount + 200,
                        createdAt: expectToday,
                        updatedAt: expectToday,
                    });

                    productA = body;
                });
            });
            describe("Given un-updated product name", () => {
                it("Should not break", async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${productB.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ productName: productB.productName }));
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({ ...productB, updatedAt: expectToday });

                    productB = body;
                });
            });
            describe("Given invalid json productDetails", () => {
                it(`Should return 400 and ${rt.invalidJsonString}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${productB.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", "invalid-json");
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidJsonString));
                });
            });
            describe("Given invalid input (ex: non-boolean published)", () => {
                it(`Should return 400 and ${rt.invalidInput}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${productB.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ published: "not-boolean" }));
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidInput));
                });
            });
            describe("Given invalid product id", () => {
                it(`Should return 404 and ${rt.productNotFound}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/invalid-product-id`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ published: true }));

                    expect(statusCode).toBe(404);
                    expect(body).toEqual(createSingleResponse(rt.productNotFound));
                });
            });
            describe("Given existing product name", () => {
                it(`Should return 409 and ${rt.productNameAlreadyExist}`, async () => {
                    const { body, statusCode } = await request.patch(`${mainPath}/${productB.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .field("productDetails", JSON.stringify({ productName: productA.productName }));
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.productNameAlreadyExist));
                });
            });
        });
        describe("DELETE", () => {
            describe("Given valid product id", () => {
                it("Should delete the product", async () => {
                    const { body, statusCode } = await request.delete(`${mainPath}/${productA.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);

                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));
                });
            });
            describe("Given invalid product id", () => {
                it(`Should return 404 and ${rt.productNotFound}`, async () => {
                    const { body, statusCode } = await request.delete(`${mainPath}/${productA.productId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);

                    expect(statusCode).toBe(404);
                    expect(body).toEqual(createSingleResponse(rt.productNotFound));
                });
            });
        });
    });
});