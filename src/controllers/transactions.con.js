/* eslint-disable indent */
const {
    catchInternalError,
    createSingleResponse } = require("./controller-commons/functions");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { transactionsRepo } = require("../repositories");
module.exports = {
    getOne: (req, res) => {
        catchInternalError(res, async () => {
            const { transactionId } = req.params;
            try {
                const transaction = await transactionsRepo.getOne({ transactionId });
                res.json(transaction);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.notFound:
                        res.status(sc.notFound).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    getMany: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const getManyQueries = req.query;
                const transactions = await transactionsRepo.getMany({ getManyQueries });
                res.json(transactions);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    }
};