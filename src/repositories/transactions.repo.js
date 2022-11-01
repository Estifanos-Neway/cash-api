const _ = require("lodash");
const { Transaction } = require("../entities");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { transactionsDb } = require("../database");
const repoUtils = require("./repo.utils");

module.exports = {
    getOne: async ({ transactionId }) => {
        if (!Transaction.isValidTransactionId(transactionId)) {
            throw utils.createError(rt.invalidTransactionId, rc.invalidInput);
        } else {
            const transaction = await transactionsDb.findOne({ id: transactionId });
            if (!transaction) {
                throw utils.createError(rt.TransactionNotFound, rc.notFound);
            } else {
                return transaction.toJson();
            }
        }
    },
    getMany: async ({ getManyQueries }) => {
        let { filter, skip, limit, select, sort } = repoUtils.validateGetManyQuery({ getManyQueries, defaultLimit: 8, maxLimit: 20 });
        sort = _.isEmpty(sort) ? { transactedAt: -1 } : sort;
        const transactionsList = await transactionsDb.findMany({ filter, skip, limit, select, sort });
        return transactionsList.map(transaction => transaction.toJson());
    }
};