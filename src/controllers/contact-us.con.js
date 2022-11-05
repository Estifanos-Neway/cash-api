/* eslint-disable indent */
const {
    catchInternalError,
    createSingleResponse,
    sendSuccessResponse } = require("./controller-commons/functions");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { contactUsRepo } = require("../repositories");

module.exports = {
    send: (req, res) => {
        catchInternalError(res, async () => {
            try {
                await contactUsRepo.send(req.body);
                sendSuccessResponse(res);
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