const { Transaction, Affiliate } = require("../entities");
const { db } = require("./db.commons");
const { transactionDbModel, affiliateDbModel } = require("./db-models");

async function populateTransaction(transaction, options) {
    if (transaction.affiliate?.userId) {
        const affiliateDoc = await db.findOne(affiliateDbModel, { id: transaction.affiliate.userId }, ["fullName"], options);
        transaction.affiliate = affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, Affiliate.idName).toJson() : undefined;
    }
    if (transaction.reason.affiliate?.userId) {
        const affiliateDoc = await db.findOne(affiliateDbModel, { id: transaction.reason.affiliate.userId }, ["fullName"], options);
        transaction.reason.affiliate = affiliateDoc ? db.adaptEntity(Affiliate, affiliateDoc, Affiliate.idName).toJson() : undefined;
    }
    return transaction;
}
const idName = Transaction.idName;
module.exports = {
    exists: async (conditions) => {
        const docWithId = await db.exists(transactionDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: async (conditions) => await db.count(transactionDbModel, conditions),
    create: async (transaction, options) => {
        db.sanitizeOptions(options);
        const transactionDoc = await db.create(transactionDbModel, transaction.toJson(), options);
        transaction = db.adaptEntity(Transaction, transactionDoc, idName);
        await populateTransaction(transaction, options);
        return transaction;
    },
    findOne: async (conditions, select) => {
        const transactionDoc = await db.findOne(transactionDbModel, conditions, select);
        const transaction = transactionDoc ? db.adaptEntity(Transaction, transactionDoc, idName) : null;
        if (transaction) {
            await populateTransaction(transaction);
        }
        return transaction;
    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const transactionDocList = await db.findMany({ model: transactionDbModel, filter, skip, limit, select, sort });
        const transactionList = [];
        for (const transactionDoc of transactionDocList) {
            const transaction = db.adaptEntity(Transaction, transactionDoc, idName);
            await populateTransaction(transaction);
            transactionList.push(transaction);
        }
        return transactionList;
    }
};