const mongoose = require("mongoose");
const { env } = require("../../env");
const { adminsRepo } = require("../../repositories");
const { defaultAdmin } = require("../../configs");
const utils = require("../../commons/functions");
const supertest = require("supertest");
const { makeApp } = require("../../app");
const testUtils = require("./test.utils");
const { Order } = require("../../entities");

describe("/analytics", () => {
    testUtils.setJestTimeout();
    jest.spyOn(utils, "sendEmail").mockReturnValue(Promise.resolve(true));
    const mainPath = "/analytics";
    const adminCredentials = {
        username: defaultAdmin.username,
        passwordHash: utils.hash(defaultAdmin.password)
    };
    let products = [
        {
            productName: "Product-A",
            price: 2000,
            commission: 500
        },
        {
            productName: "Product-B",
            price: 2000,
            commission: 500
        }
    ];
    let affiliates = [
        {
            fullName: "Affiliate-A",
            phone: "+251987654321",
            email: "a@gmail.com",
            passwordHash: "pwh"
        },
        {
            fullName: "Affiliate-A",
            phone: "+251987654322",
            email: "b@gmail.com",
            passwordHash: "pwh",
            parentId: undefined
        }
    ];

    let orders = [
        {
            product: {
                productId: undefined
            },
            orderedBy: {
                fullName: "Full-N-A",
                phone: "+251987654321"
            }
        },
        {
            product: {
                productId: undefined
            },
            orderedBy: {
                fullName: "Full-N-B",
                phone: "+251987654321"
            },
            affiliate: {
                userId: undefined
            }
        }
    ];

    let req, accessToken;

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

        for (const index in products) {
            // @ts-ignore
            const { statusCode: statusCodeProduct, body: bodyProduct } = await req.post("/products")
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${accessToken}`)
                .field("productDetails", JSON.stringify(products[index]));
            expect(statusCodeProduct).toBe(200);
            products[index] = bodyProduct;
            orders[0].product.productId = bodyProduct.productId;
            orders[1].product.productId = bodyProduct.productId;
        }

        const verificationCode = "vCode";
        jest.spyOn(utils, "createVerificationCode").mockReturnValue(verificationCode);
        for (const index in affiliates) {
            // @ts-ignore
            const { statusCode: statusCodeSignUp, body: signUp } = await req.post("/affiliates/sign-up")
                .set("Api-Key", env.API_KEY)
                .send(affiliates[index]);
            expect(statusCodeSignUp).toBe(200);
            // @ts-ignore
            const { statusCode: statusCodeVerify, body: affiliateSignIn } = await req.post("/affiliates/verify-sign-up")
                .set("Api-Key", env.API_KEY)
                .send({ verificationToken: signUp.verificationToken, verificationCode });
            expect(statusCodeVerify).toBe(200);
            affiliates[index] = affiliateSignIn.affiliate;
            // @ts-ignore
            orders[1].affiliate.userId = affiliateSignIn.affiliate.userId;
        }
        for (const index in orders) {
            // @ts-ignore
            const { statusCode: statusCodeOrder, body: bodyOrder } = await req.post("/orders")
                .set("Api-Key", env.API_KEY)
                .send(orders[index]);
            expect(statusCodeOrder).toBe(200);
            orders[index] = bodyOrder;
        }
        // @ts-ignore
        const { statusCode: statusCodeAccept, body: bodyAccept } = await req.patch(`/orders/${orders[1].orderId}/accept`)
            .set("Api-Key", env.API_KEY)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(statusCodeAccept).toBe(200);
        orders[1] = bodyAccept;
        for (const index in affiliates) {
            // @ts-ignore
            const { statusCode: statusCodeAffiliate, body: bodyAffiliate } = await req.get(`/affiliates/${affiliates[index].userId}`)
                .set("Api-Key", env.API_KEY)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(statusCodeAffiliate).toBe(200);
            affiliates[index] = bodyAffiliate;
        }
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
        describe("/counts GET", () => {
            const subPath = mainPath + "/counts";
            it("Should return the correct counts", async () => {
                const analytics = {
                    counts: {
                        totalProducts: products.length,
                        totalOrders: orders.length,
                        acceptedOrders: orders.filter(order => order.status === Order.statuses.Accepted).length,
                        totalAffiliates: affiliates.length,
                        totalEarned: affiliates.reduce((preVal, affiliate) => preVal + affiliate.wallet.totalMade, 0),
                        totalUnpaid: affiliates.reduce((preVal, affiliate) => preVal + affiliate.wallet.currentBalance, 0)
                    }
                };
                const { statusCode, body } = await req.get(subPath)
                    .set("Api-Key", env.API_KEY)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(statusCode).toBe(200);
                expect(body).toEqual(analytics);
            });
        });
    });

});