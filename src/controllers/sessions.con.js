/* eslint-disable indent */
const { catchInternalError } = require("./controller-commons/functions");
const { createSingleResponse } = require("./controller-commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { sessionsRepo } = require("../repositories");
module.exports = Object.freeze({
    refresh: async (req, res) => {
        catchInternalError(res, async () => {
            const refreshToken = req.get("Refresh-Token");
            try {
                const newAccessToken = await sessionsRepo.refresh(refreshToken);
                res.json({ newAccessToken });
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.unauthorized:
                        res.status(sc.unauthorized).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    signOut: async (req, res) => {
        catchInternalError(res, async () => {
            const refreshToken = req.get("Refresh-Token");
            try {
                await sessionsRepo.signOut(refreshToken);
                res.json(createSingleResponse(rt.success));
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
});
