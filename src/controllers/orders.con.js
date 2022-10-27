/* eslint-disable indent */
const {
    catchInternalError,
    createSingleResponse } = require("./controller-commons/functions");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { ordersRepo } = require("../repositories");
module.exports = {
    create: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const order = await ordersRepo.create(req.body);
                res.json(order);
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
    }
};