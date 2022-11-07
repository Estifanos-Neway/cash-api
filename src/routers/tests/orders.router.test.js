const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../configs");
const utils = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const rt = require("../../commons/response-texts");
const { createSingleResponse } = require("../../controllers/controller-commons/functions");
const { Order } = require("../../entities");
const testUtils = require("./test.utils");

describe("/orders", () => {
    testUtils.setJestTimeout();
    const mainPath = "/orders";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: utils.hash(defaultAdmin.password)
    };
    let product = {
        productName: "Product-A",
        price: 200,
        commission: 25
    };
    let affiliate = {
        fullName: "Affiliate-A",
        phone: "+251987654321",
        email: "cashmart.et@gmail.com",
        passwordHash: "pwh"
    };
    let orderA = {
        product: {
            productId: undefined
        },
        orderedBy: {
            fullName: "Full-N-A",
            phone: "+251987654321"
        }
    };
    let orderB = {
        product: {
            productId: undefined
        },
        orderedBy: {
            fullName: "Full-N-B",
            phone: "+251987654321"
        },
        affiliate: {
            userId: ["invalid"]
        }
    };
    let orderC = {
        product: {
            productId: undefined
        },
        orderedBy: {
            fullName: "Full-N-C",
            phone: "+251999999999",
            companyName: "Comp-N"
        },
        affiliate: {
            userId: undefined
        }
    };
    let orderD = {
        product: {
            productId: undefined
        },
        orderedBy: {
            fullName: "Full-N-D",
            phone: "+251999999999",
            companyName: "Comp-N"
        },
        affiliate: {
            userId: undefined
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const expectToday = expect.stringMatching(`^${today}T.+$`);
    let req, accessToken, productInOrder;

    beforeAll(async () => {
        // @ts-ignore
        await mongoose.connect(env.DB_URL_TEST, { keepAlive: true });
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (let collection of collections) {
            await db.dropCollection(collection.name);
        }
        await adminsRepo.signUp({ ...adminCredentials });
        req = supertest(makeApp());
        // @ts-ignore
        const { statusCode, body: adminSignIn } = await req.post("/admin/sign-in")
            .set("Api-Key", env.API_KEY)
            .send(adminCredentials);
        expect(statusCode).toBe(200);
        accessToken = adminSignIn.accessToken;

        // @ts-ignore
        const { statusCode: statusCodeProduct, body: bodyProduct } = await req.post("/products")
            .set("Api-Key", env.API_KEY)
            .set("Authorization", `Bearer ${accessToken}`)
            .field("productDetails", JSON.stringify(product));
        expect(statusCodeProduct).toBe(200);
        product = bodyProduct;
        orderA.product.productId = product.productId;
        orderB.product.productId = product.productId;
        orderC.product.productId = product.productId;
        orderD.product.productId = product.productId;
        productInOrder = {
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            commission: product.commission
        };

        const verificationCode = "vCode";
        jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
        jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
        // @ts-ignore
        const { statusCode: statusCodeSignUp, body: signUp } = await req.post("/affiliates/sign-up")
            .set("Api-Key", env.API_KEY)
            .send(affiliate);
        expect(statusCodeSignUp).toBe(200);
        // @ts-ignore
        const { statusCode: statusCodeVerify, body: affiliateSignIn } = await req.post("/affiliates/verify-sign-up")
            .set("Api-Key", env.API_KEY)
            .send({ verificationToken: signUp.verificationToken, verificationCode });
        expect(statusCodeVerify).toBe(200);
        affiliate = affiliateSignIn.affiliate;
        orderC.affiliate.userId = affiliate.userId;
        orderD.affiliate.userId = affiliate.userId;
    });

    beforeEach(async () => {
        req = supertest(makeApp());
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
            describe("Given valid order data", () => {
                it("Should create and return the order", async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(orderA);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({
                        ...orderA,
                        orderId: expect.any(String),
                        product: productInOrder,
                        orderedAt: expectToday,
                        status: Order.statuses.Pending
                    });
                    orderA = body;
                });
            });
            describe("Given invalid affiliate.userId", () => {
                it("Should create and return the order", async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(orderB);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({
                        ...orderB,
                        orderId: expect.any(String),
                        product: productInOrder,
                        affiliate: undefined,
                        orderedAt: expectToday,
                        status: Order.statuses.Pending
                    });
                    orderB = body;
                });
            });
            describe("Given valid affiliate.userId", () => {
                it("Should create and return the order", async () => {

                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(orderC);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual({
                        ...orderC,
                        orderId: expect.any(String),
                        product: productInOrder,
                        orderedAt: expectToday,
                        affiliate: {
                            userId: affiliate.userId,
                            fullName: affiliate.fullName
                        },
                        status: Order.statuses.Pending
                    });
                    orderC = body;

                    const { statusCode: statusCodeAffiliate, body: bodyAffiliate } = await req.get(`/affiliates/${affiliate.userId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCodeAffiliate).toBe(200);
                    expect(bodyAffiliate).toHaveProperty("affiliationSummary.totalRequests", 1);

                });
            });
            describe("Given invalid product.productId", () => {
                it(`Should return 400 and ${rt.invalidProductId} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: "invalid"
                                },
                                orderedBy: orderA.orderedBy
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidProductId));
                });
            });
            describe("Given valid but non-existing product.productId", () => {
                it(`Should return 404 and ${rt.productNotFound} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: utils.generateDbId()
                                },
                                orderedBy: orderA.orderedBy
                            }
                        );
                    expect(statusCode).toBe(404);
                    expect(body).toEqual(createSingleResponse(rt.productNotFound));
                });
            });
            describe("Given no product", () => {
                it(`Should return 400 and ${rt.requiredParamsNotFound} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                orderedBy: orderA.orderedBy
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                });
            });
            describe("Given invalid or no orderedBy.fullName", () => {
                it(`Should return 400 and ${rt.invalidFullName} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: product.productId
                                },
                                orderedBy: {
                                    fullName: ["invalid"],
                                    phone: "+251987654321"
                                }
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidFullName));
                });
            });
            describe("Given invalid or no orderedBy.phone", () => {
                it(`Should return 400 and ${rt.invalidPhone} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: product.productId
                                },
                                orderedBy: {
                                    fullName: "Full-N"
                                }
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidPhone));
                });
            });
            describe("Given invalid orderedBy.companyName", () => {
                it(`Should return 400 and ${rt.invalidCompanyName} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: product.productId
                                },
                                orderedBy: {
                                    fullName: "Full-N",
                                    phone: "+251987654321",
                                    companyName: ["invalid"]
                                }
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidCompanyName));
                });
            });
            describe("Given no orderedBy", () => {
                it(`Should return 400 and ${rt.requiredParamsNotFound} `, async () => {
                    const { statusCode, body } = await req.post(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .send(
                            {
                                product: {
                                    productId: product.productId
                                }
                            }
                        );
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.requiredParamsNotFound));
                });
            });
        });
        describe("GET", () => {
            describe("Given no params", () => {
                it("Should return list of orders", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderC, orderB, orderA]);
                });
            });
            describe("Given query filter={orderedBy.fullName:'Full-N-B'}", () => {
                it("Should return [orderB]", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ filter: JSON.stringify({ "orderedBy.fullName": orderB.orderedBy.fullName }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderB]);
                });
            });
            describe("Given query search={orderedBy.fullName:'[a,c]$'}", () => {
                it("Should return [orderA,orderC]", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ search: JSON.stringify({ "orderedBy.fullName": "[a,c]$" }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderC, orderA]);
                });
            });
            describe("Given query limit=2", () => {
                it("Should return [orderC,orderB]", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ limit: 2 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderC, orderB]);
                });
            });
            describe("Given query skip=1", () => {
                it("Should return [orderB,orderA]", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ skip: 1 });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderB, orderA]);
                });
            });
            describe("Given query select=['orderedBy.fullName', 'orderedAt']", () => {
                it("Should return orders with 'orderedBy.fullName', 'orderedAt' only", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ select: JSON.stringify(["orderedBy.fullName", "orderedAt"]) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([
                        {
                            orderId: orderC.orderId,
                            orderedBy: {
                                fullName: orderC.orderedBy.fullName
                            },
                            orderedAt: orderC.orderedAt
                        },
                        {
                            orderId: orderB.orderId,
                            orderedBy: {
                                fullName: orderB.orderedBy.fullName
                            },
                            orderedAt: orderB.orderedAt
                        },
                        {
                            orderId: orderA.orderId,
                            orderedBy: {
                                fullName: orderA.orderedBy.fullName
                            },
                            orderedAt: orderA.orderedAt
                        },
                    ]);
                });
            });
            describe("Given query sort={orderedBy.fullName: 1}", () => {
                it("Should return [orderA, orderB, orderC]", async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ sort: JSON.stringify({ "orderedBy.fullName": 1 }) });
                    expect(statusCode).toBe(200);
                    expect(body).toEqual([orderA, orderB, orderC]);
                });
            });
            describe("Given invalid search query", () => {
                it(`Should return 400 and ${rt.invalidSearchQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ search: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSearchQuery));
                });
            });
            describe("Given invalid filter query", () => {
                it(`Should return 400 and ${rt.invalidFilterQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ filter: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidFilterQuery));
                });
            });
            describe("Given invalid select query", () => {
                it(`Should return 400 ${rt.invalidSelectQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ select: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSelectQuery));
                });
            });
            describe("Given invalid skip query", () => {
                it(`Should return 400 ${rt.invalidSkipQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ skip: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSkipQuery));
                });
            });
            describe("Given invalid limit query", () => {
                it(`Should return 400 ${rt.invalidLimitQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ limit: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidLimitQuery));
                });
            });
            describe("Given invalid sort query", () => {
                it(`Should return 400 ${rt.invalidSortQuery}`, async () => {
                    const { body, statusCode } = await req.get(mainPath)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .query({ sort: "string-is-not-valid" });
                    expect(statusCode).toBe(400);
                    expect(body).toEqual(createSingleResponse(rt.invalidSortQuery));
                });
            });
        });
    });
    describe("/{orderId}", () => {
        describe("Given invalid orderId", () => {
            it(`Should return 400 and ${rt.invalidOrderId}`, async () => {
                const { body, statusCode } = await req.get(`${mainPath}/invalid"}`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(statusCode).toBe(400);
                expect(body).toEqual(createSingleResponse(rt.invalidOrderId));
            });
        });
        describe("Given valid but non-existing orderId", () => {
            it(`Should return 404 and ${rt.userNotFound}`, async () => {
                const orderId = utils.generateDbId();
                const { body, statusCode } = await req.get(`${mainPath}/${orderId}`)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(statusCode).toBe(404);
                expect(body).toEqual(createSingleResponse(rt.orderNotFound));
            });
        });
        describe("/ GET", () => {
            describe("Given valid orderId", () => {
                it("Should return the order", async () => {
                    const { body, statusCode } = await req.get(`${mainPath}/${orderA.orderId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(orderA);
                });
            });
        });
        describe("/accept PATCH", () => {
            describe("Given", () => {
                describe("Given valid and pending order id", () => {
                    it("Should update the orders status to 'Accepted'", async () => {
                        const { body, statusCode } = await req.patch(`${mainPath}/${orderC.orderId}/accept`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(200);
                        expect(body).toEqual(
                            {
                                ...orderC,
                                status: Order.statuses.Accepted
                            });
                        const { statusCode: statusCodeAffiliate, body: bodyAffiliate } = await req.get(`/affiliates/${affiliate.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCodeAffiliate).toBe(200);
                        expect(bodyAffiliate).toHaveProperty("affiliationSummary.acceptedRequests", 1);
                    });
                });
                describe("Given id of a non-pending order", () => {
                    it(`Should return 409 and ${rt.orderAlreadyUnpended} `, async () => {
                        const { body, statusCode } = await req.patch(`${mainPath}/${orderC.orderId}/accept`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(409);
                        expect(body).toEqual(createSingleResponse(rt.orderAlreadyUnpended));
                    });
                });
            });
        });
        describe("/reject PATCH", () => {
            describe("Given", () => {
                describe("Given valid and pending order id", () => {
                    it("Should update the orders status to 'Rejected'", async () => {
                        const { statusCode: statusCode1, body: body1 } = await req.post(mainPath)
                            .set("Api-Key", env.API_KEY)
                            .send(orderD);
                        expect(statusCode1).toBe(200);
                        orderD = body1;
                        const { body: body2, statusCode: statusCode2 } = await req.patch(`${mainPath}/${orderD.orderId}/reject`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode2).toBe(200);
                        expect(body2).toEqual(
                            {
                                ...orderD,
                                status: Order.statuses.Rejected
                            });
                        const { statusCode: statusCodeAffiliate, body: bodyAffiliate } = await req.get(`/affiliates/${affiliate.userId}`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCodeAffiliate).toBe(200);
                        expect(bodyAffiliate).toHaveProperty("affiliationSummary.rejectedRequests", 1);
                    });
                });
                describe("Given id of a non-pending order", () => {
                    it(`Should return 409 and ${rt.orderAlreadyUnpended} `, async () => {
                        const { body, statusCode } = await req.patch(`${mainPath}/${orderD.orderId}/reject`)
                            .set("Api-Key", env.API_KEY)
                            .set("Authorization", `Bearer ${accessToken}`);
                        expect(statusCode).toBe(409);
                        expect(body).toEqual(createSingleResponse(rt.orderAlreadyUnpended));
                    });
                });
            });
        });
        describe("/ DELETE", () => {
            describe("Given valid and non-pending order id", () => {
                it("Should delete the order", async () => {
                    const { body, statusCode } = await req.delete(`${mainPath}/${orderC.orderId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(createSingleResponse(rt.success));
                });
            });
            describe("Given pending order id", () => {
                it(`Should return 409 and ${rt.pendingOrder} `, async () => {
                    const { body, statusCode } = await req.delete(`${mainPath}/${orderA.orderId}`)
                        .set("Api-Key", env.API_KEY)
                        .set("Authorization", `Bearer ${accessToken}`);
                    expect(statusCode).toBe(409);
                    expect(body).toEqual(createSingleResponse(rt.pendingOrder));
                });
            });
        });
    });

});