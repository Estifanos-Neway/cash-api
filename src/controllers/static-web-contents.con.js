/* eslint-disable indent */
const { staticWebContentsRepo } = require("../repositories");
const { catchInternalError, createSingleResponse } = require("./controller-commons/functions");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");

module.exports = Object.freeze({
    update: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const staticWebContents = await staticWebContentsRepo.update(req.body);
                res.json(staticWebContents);
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
    get: (req, res) => {
        catchInternalError(res, async () => {
            const staticWebContents = await staticWebContentsRepo.get();
            res.json(staticWebContents);
        });
    }
});