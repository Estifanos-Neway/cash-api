const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const entities = require("../entities");
const dbs = require("../database");

const strict = true;
module.exports = {
    create: async ({ product, orderedBy, affiliateId }) => {
        // @ts-ignore
        const order = new entities.Order({ product, orderedBy, affiliateId });
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
            const productExist = await dbs.productsDb.exists({ id: product.productId });
            if (!productExist) {
                throw utils.createError(rt.productNotFound, rc.notFound);
            } else {
                if (order.affiliateId) {
                    const affiliateExists = await dbs.affiliatesDb.exists({ id: order.affiliateId });
                    if (!affiliateExists) {
                        order.affiliateId = undefined;
                    }
                }
                const orderInDb = await dbs.ordersDb.create(order);
                return orderInDb.toJson();
            }
        }
    }
};