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
        const orderExist = await ordersDb.findOne({ id });
        if (!orderExist) {
            throw utils.createError(rt.orderNotFound, rc.notFound);
        }
    }
}

const strict = true;
module.exports = {
    create: async ({ product, orderedBy, affiliate }) => {
        // @ts-ignore
        const order = new Order({ product, orderedBy, affiliate });
        if (!order.product) {
            throw utils.createError(rt.invalidProduct, rc.invalidInput);
        } else if (!order.product?.hasValidProductId(strict)) {
            throw utils.createError(rt.invalidProductId, rc.invalidInput);
        } else if (!order.orderedBy) {
            throw utils.createError(rt.invalidOrderedBy, rc.invalidInput);
        } else if (!order.orderedBy.hasValidFullName(strict)) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else if (!order.orderedBy.hasValidPhone(strict)) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else if (!order.orderedBy.hasValidCompanyName()) {
            throw utils.createError(rt.invalidCompanyName, rc.invalidInput);
        } else if (!_.isUndefined(order.affiliate) && !order.affiliate.hasValidUserId(strict)) {
            throw utils.createError(rt.invalidAffiliateId, rc.invalidInput);
        } else {
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
    acceptOrder: async ({ orderId }) => {
        await validateOrderIdExistence({ id: orderId });
    }
};