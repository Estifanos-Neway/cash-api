/* eslint-disable indent */
const {
    catchInternalError,
    createSingleResponse,
    sendSuccessResponse } = require("./controller-commons/functions");
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
    },
    getOne: (req, res) => {
        catchInternalError(res, async () => {
            const { orderId } = req.params;
            try {
                const order = await ordersRepo.getOne({ orderId });
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
    },
    getMany: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const getManyQueries = req.query;
                const orders = await ordersRepo.getMany({ getManyQueries });
                res.json(orders);
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
    },
    accept: (req, res) => {
        catchInternalError(res, async () => {
            const { orderId } = req.params;
            try {
                const order = await ordersRepo.accept({ orderId });
                res.json(order);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.notFound:
                        res.status(sc.notFound).json(createSingleResponse(error.message));
                        break;
                    case rc.conflict:
                        res.status(sc.conflict).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    reject: (req, res) => {
        catchInternalError(res, async () => {
            const { orderId } = req.params;
            try {
                const order = await ordersRepo.reject({ orderId });
                res.json(order);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.notFound:
                        res.status(sc.notFound).json(createSingleResponse(error.message));
                        break;
                    case rc.conflict:
                        res.status(sc.conflict).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    delete: (req, res) => {
        catchInternalError(res, async () => {
            const { orderId } = req.params;
            try {
                await ordersRepo.delete({ orderId });
                sendSuccessResponse(res);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.notFound:
                        res.status(sc.notFound).json(createSingleResponse(error.message));
                        break;
                    case rc.conflict:
                        res.status(sc.conflict).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    }
};