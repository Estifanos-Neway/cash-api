const { Order, Product } = require("../entities");
const { db } = require("./db.commons");
const { orderDbModel, productDbModel } = require("./db-models");

async function populateProduct(order) {
    const productDoc = await db.findOne(productDbModel, { id: order.product.productId });
    order.product = productDoc ? db.adaptEntity(Product, productDoc, Product.idName).toJson() : undefined;
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
    create: async (order) => {
        const orderDoc = await db.create(orderDbModel, order.toJson());
        order = db.adaptEntity(Order, orderDoc, idName);
        await populateProduct(order);
        return order;
    },
    findOne: async (conditions, select) => {
        const orderDoc = await db.findOne(orderDbModel, conditions, select);
        const order = orderDoc ? db.adaptEntity(Order, orderDoc, idName) : null;
        if (order) {
            await populateProduct(order);
        }
        return order;

    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const orderDocList = await db.findMany({ model: orderDbModel, filter, skip, limit, select, sort });
        const orderList = [];
        for (const orderDoc of orderDocList) {
            const order = db.adaptEntity(Order, orderDoc, idName);
            await populateProduct(order);
            orderList.push(order);
        }
        return orderList;
    },
    updateOne: async (conditions, updates) => {
        const orderDoc = await db.updateOne(orderDbModel, conditions, updates);
        return db.adaptEntity(Order, orderDoc, idName);
    },
    deleteOne: async (conditions) => {
        const orderDoc = await db.deleteOne(orderDbModel, conditions);
        return orderDoc ? db.adaptEntity(Order, orderDoc, idName) : null;
    }
};