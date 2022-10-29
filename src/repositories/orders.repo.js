const _ = require("lodash");
const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const { Order } = require("../entities");
const { db, ordersDb, productsDb, affiliatesDb } = require("../database");
const repoUtils = require("./repo.utils");

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
                await affiliatesDb.increment({ id: updatedOrder.affiliate.userId }, { "affiliationSummary.acceptedRequests": 1 }, sessionOption);
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