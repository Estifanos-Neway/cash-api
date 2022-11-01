const _ = require("lodash");
const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const { Order, Transaction } = require("../entities");
const { db, ordersDb, productsDb, affiliatesDb, transactionsDb } = require("../database");
const repoUtils = require("./repo.utils");
const configs = require("../config.json");

async function validateOrderIdExistence({ id }) {
    if (!Order.isValidOrderId(id)) {
        throw utils.createError(rt.invalidOrderId, rc.invalidInput);
    } else {
        const orderExist = await ordersDb.exists({ id });
        if (!orderExist) {
            throw utils.createError(rt.orderNotFound, rc.notFound);
        }
    }
}
async function validateOrderPending({ id }) {
    const orderIsPending = await ordersDb.exists({ id, status: Order.statuses.Pending });
    if (!orderIsPending) {
        throw utils.createError(rt.orderAlreadyUnpended, rc.conflict);
    }
}

async function createProductSellTransactionList(order) {
    const { productSellCredits: { creditSubtractionPercent, minCredit } } = configs;
    const transactionList = [];
    let userId = order.affiliate.userId;
    let { productId, commission: remainingCommission } = order.product;
    let creditAmount = remainingCommission * creditSubtractionPercent;
    if (creditAmount < minCredit) {
        creditAmount = remainingCommission;
        remainingCommission = 0;
    } else {
        remainingCommission -= creditAmount;
    }
    const soldProduct = new Transaction(
        {
            affiliate: {
                userId
            },
            amount: creditAmount,
            // @ts-ignore
            reason: new Transaction.Reason({
                kind: Transaction.Reason.kinds.SoldProduct,
                productId
            }).toJson()
        }
    );
    transactionList.push(soldProduct);

    while (remainingCommission > 0) {
        creditAmount = remainingCommission * creditSubtractionPercent;
        if (creditAmount < minCredit) {
            creditAmount = remainingCommission;
            remainingCommission = 0;
        } else {
            remainingCommission -= creditAmount;
        }
        const affiliate = await affiliatesDb.findOne({ id: userId });
        userId = affiliate?.parentId;
        if (!userId) {
            break;
        } else {
            const childSoldProduct = new Transaction(
                {
                    affiliate: {
                        userId
                    },
                    amount: creditAmount,
                    reason: new Transaction.Reason({
                        kind: Transaction.Reason.kinds.ChildSoldProduct,
                        affiliate: {
                            userId: affiliate.userId
                        },
                        productId
                    }).toJson()
                }
            );
            transactionList.push(childSoldProduct);
        }
    }
    return transactionList;
}

const strict = true;
module.exports = {
    create: async ({ product, orderedBy, affiliate }) => {
        // @ts-ignore
        const order = new Order({ product, orderedBy, affiliate });
        if (!order.product) {
            throw utils.createError(rt.requiredParamsNotFound, rc.invalidInput);
        } else if (!order.product?.hasValidProductId(strict)) {
            throw utils.createError(rt.invalidProductId, rc.invalidInput);
        } else if (!order.orderedBy) {
            throw utils.createError(rt.requiredParamsNotFound, rc.invalidInput);
        } else if (!order.orderedBy.hasValidFullName(strict)) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else if (!order.orderedBy.hasValidPhone(strict)) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else if (!order.orderedBy.hasValidCompanyName()) {
            throw utils.createError(rt.invalidCompanyName, rc.invalidInput);
        } else {
            if (!_.isUndefined(order.affiliate) && !order.affiliate.hasValidUserId(strict)) {
                order.affiliate = undefined;
            }
            const productExist = await productsDb.exists({ id: product.productId });
            if (!productExist) {
                throw utils.createError(rt.productNotFound, rc.notFound);
            } else {
                if (order.affiliate?.userId) {
                    const affiliateExists = await affiliatesDb.exists({ id: order.affiliate.userId });
                    if (!affiliateExists) {
                        order.affiliate = undefined;
                    }
                }
                const dbSession = new db.DbSession();
                await dbSession.startSession();
                const sessionOption = { session: dbSession.session };
                let orderInDb;
                await dbSession.withTransaction(async () => {
                    orderInDb = await ordersDb.create(order, sessionOption);
                    if (order.affiliate) {
                        await affiliatesDb.increment({ id: order.affiliate.userId }, { "affiliationSummary.totalRequests": 1 }, sessionOption);
                    }
                });
                await dbSession.endSession();
                // @ts-ignore
                return orderInDb.toJson();
            }
        }
    },
    getOne: async ({ orderId }) => {
        await validateOrderIdExistence({ id: orderId });
        const order = await ordersDb.findOne({ id: orderId });
        if (!order) {
            throw utils.createError(rt.orderNotFound, rc.notFound);
        } else {
            return order.toJson();
        }
    },
    getMany: async ({ getManyQueries }) => {
        let { filter, skip, limit, select, sort } = repoUtils.validateGetManyQuery({ getManyQueries, defaultLimit: 8, maxLimit: 20 });
        sort = _.isEmpty(sort) ? { orderedAt: -1 } : sort;
        const orderList = await ordersDb.findMany({ filter, skip, limit, select, sort });
        return orderList.map(order => order.toJson());
    },
    accept: async ({ orderId }) => {
        await validateOrderIdExistence({ id: orderId });
        await validateOrderPending({ id: orderId });
        const dbSession = new db.DbSession();
        await dbSession.startSession();
        const sessionOption = { session: dbSession.session };
        let updatedOrder;
        await dbSession.withTransaction(async () => {
            updatedOrder = await ordersDb.updateOne({ id: orderId }, { status: Order.statuses.Accepted }, sessionOption);
            if (updatedOrder.affiliate) {
                const userId = updatedOrder.affiliate.userId;
                await affiliatesDb.increment({ id: userId }, { "affiliationSummary.acceptedRequests": 1 }, sessionOption);
                const productSellTransactionList = await createProductSellTransactionList(updatedOrder);
                for (let transaction of productSellTransactionList) {
                    const userId = transaction.affiliate.userId;
                    const incrementor = { "wallet.totalMade": transaction.amount, "wallet.currentBalance": transaction.amount };
                    await affiliatesDb.increment({ id: userId }, incrementor, sessionOption);
                    await transactionsDb.create(transaction, sessionOption);
                }
            }
        });
        await dbSession.endSession();
        // @ts-ignore
        return updatedOrder.toJson();
    },
    reject: async ({ orderId }) => {
        await validateOrderIdExistence({ id: orderId });
        await validateOrderPending({ id: orderId });
        const dbSession = new db.DbSession();
        await dbSession.startSession();
        const sessionOption = { session: dbSession.session };
        let updatedOrder;
        await dbSession.withTransaction(async () => {
            updatedOrder = await ordersDb.updateOne({ id: orderId }, { status: Order.statuses.Rejected }, sessionOption);
            if (updatedOrder.affiliate) {
                await affiliatesDb.increment({ id: updatedOrder.affiliate.userId }, { "affiliationSummary.rejectedRequests": 1 }, sessionOption);
            }
        });
        await dbSession.endSession();
        // @ts-ignore
        return updatedOrder.toJson();
    },
    delete: async ({ orderId }) => {
        await validateOrderIdExistence({ id: orderId });
        const orderIsPending = await ordersDb.exists({ id: orderId, status: Order.statuses.Pending });
        if (orderIsPending) {
            throw utils.createError(rt.pendingOrder, rc.conflict);
        } else {
            const deletedOrder = await ordersDb.deleteOne({ id: orderId });
            if (!deletedOrder) {
                throw utils.createError(rt.orderNotFound, rc.notFound);
            } else {
                return true;
            }
        }
    }
};