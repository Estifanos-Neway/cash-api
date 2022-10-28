const { Order, Product, Affiliate } = require("../entities");
const { db } = require("./db.commons");
const { orderDbModel, productDbModel, affiliateDbModel } = require("./db-models");

async function populateOrder(order, options) {
    const productDoc = await db.findOne(productDbModel, { id: order.product.productId }, ["productName", "mainImage", "price", "commission"], options);
    order.product = productDoc ? db.adaptEntity(Product, productDoc, Product.idName).toJson() : undefined;
    if (order.affiliate) {
        const affiliateDoc = await db.findOne(affiliateDbModel, { id: order.affiliate.userId }, ["fullName"], options);
        order.affiliate = affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, Affiliate.idName).toJson() : undefined;
    }
    return order;
}
const idName = Order.idName;
module.exports = {
    exists: async (conditions) => {
        const docWithId = await db.exists(orderDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: async (conditions) => await db.count(orderDbModel, conditions),
    create: async (order, options) => {
        db.sanitizeOptions(options);
        const orderDoc = await db.create(orderDbModel, order.toJson(), options);
        order = db.adaptEntity(Order, orderDoc, idName);
        await populateOrder(order, options);
        return order;
    },
    findOne: async (conditions, select) => {
        const orderDoc = await db.findOne(orderDbModel, conditions, select);
        const order = orderDoc ? db.adaptEntity(Order, orderDoc, idName) : null;
        if (order) {
            await populateOrder(order);
        }
        return order;
    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const orderDocList = await db.findMany({ model: orderDbModel, filter, skip, limit, select, sort });
        const orderList = [];
        for (const orderDoc of orderDocList) {
            const order = db.adaptEntity(Order, orderDoc, idName);
            await populateOrder(order);
            orderList.push(order);
        }
        return orderList;
    },
    updateOne: async (conditions, updates, options) => {
        db.sanitizeOptions(options);
        const orderDoc = await db.updateOne(orderDbModel, conditions, updates, options);
        const order = db.adaptEntity(Order, orderDoc, idName);
        return await populateOrder(order);
    },
    deleteOne: async (conditions) => {
        const orderDoc = await db.deleteOne(orderDbModel, conditions);
        const order = orderDoc ? db.adaptEntity(Order, orderDoc, idName) : null;
        if (order) {
            await populateOrder(order);
        }
        return order;
    }
};