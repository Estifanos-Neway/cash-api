/* eslint-disable indent */
const rc = require("../commons/response-codes");
const { affiliatesRepo } = require("../repositories");
const { catchInternalError, createSingleResponse } = require("./controller-commons/functions");
const sc = require("./controller-commons/status-codes");

module.exports = Object.freeze({
    signUp: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const signUpVerificationToken = await affiliatesRepo.signUp(req.body);
                res.json({ signUpVerificationToken });
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.alreadyExist:
                        res.status(sc.alreadyExist).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    verifySignUp: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const signedUpAffiliate = await affiliatesRepo.verifySignUp(req.body);
                res.json(signedUpAffiliate);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.timeout:
                        res.status(sc.timeout).json(createSingleResponse(error.message));
                        break;
                    case rc.alreadyExist:
                        res.status(sc.alreadyExist).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    signIn: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const signedInAffiliate = await affiliatesRepo.signIn(req.body);
                res.json(signedInAffiliate);
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
    }
});