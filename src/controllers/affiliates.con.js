/* eslint-disable indent */
const multer = require("multer");
const streamifier = require("streamifier");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { affiliatesRepo } = require("../repositories");
const { catchInternalError, createSingleResponse, sendSuccessResponse, sendInvalidInputResponse } = require("./controller-commons/functions");

const catchAvatarMid = multer().single("avatar");
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
    },
    forgotPassword: (req, res) => {
        catchInternalError(res, async () => {
            try {
                await affiliatesRepo.forgotPassword(req.body);
                sendSuccessResponse(res);
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
    recoverPassword: (req, res) => {
        catchInternalError(res, async () => {
            try {
                await affiliatesRepo.recoverPassword(req.body);
                sendSuccessResponse(res);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.timeout:
                        res.status(sc.timeout).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    },
    updateAvatar: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            catchAvatarMid(req, res, (error) => {
                catchInternalError(res, async () => {
                    if (error && error.message !== "Unexpected field") {
                        if (error.message === "Unexpected end of form") {
                            sendInvalidInputResponse(res);
                        } else {
                            throw error;
                        }
                    } else {
                        const imageBuffer = req.file?.buffer;
                        if (!imageBuffer) {
                            sendInvalidInputResponse(res);
                        } else {
                            const imageReadStream = streamifier.createReadStream(imageBuffer);
                            const avatar = await affiliatesRepo.updateAvatar({ userId, imageReadStream });
                            res.json({ avatar });
                        }
                    }
                });
            });

        });
    },
    deleteAvatar: (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.params.userId;
            await affiliatesRepo.deleteAvatar({ userId });
            sendSuccessResponse(res);
        });
    },
    getOne: (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.params.userId;
            try {
                const affiliate = await affiliatesRepo.getOne({ userId });
                res.json(affiliate);
            } catch (error) {
                switch (error.code) {
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
                const affiliates = await affiliatesRepo.getMany({ getManyQueries });
                res.json(affiliates);
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
    getChildren: (req, res) => {
        catchInternalError(res, async () => {
            const userId = req.params.userId;
            const getManyQueries = req.query;
            try {
                const children = await affiliatesRepo.getChildren({ userId, getManyQueries });
                res.json(children);
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
});