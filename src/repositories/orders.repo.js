const _ = require("lodash");
const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const { Order } = require("../entities");
const { ordersDb, productsDb, affiliatesDb } = require("../database");
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
    create: async ({ product, orderedBy, affiliateId }) => {
        // @ts-ignore
        const order = new Order({ product, orderedBy, affiliateId });
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
        } else if (!order.hasValidAffiliateId()) {
            throw utils.createError(rt.invalidAffiliateId, rc.invalidInput);
        } else {
            const productExist = await productsDb.exists({ id: product.productId });
            if (!productExist) {
                throw utils.createError(rt.productNotFound, rc.notFound);
            } else {
                if (order.affiliateId) {
                    const affiliateExists = await affiliatesDb.exists({ id: order.affiliateId });
                    if (!affiliateExists) {
                        order.affiliateId = undefined;
                    }
                }
                const orderInDb = await ordersDb.create(order);
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
};