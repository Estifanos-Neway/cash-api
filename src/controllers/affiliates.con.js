/* eslint-disable indent */
const multer = require("multer");
const streamifier = require("streamifier");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const utils = require("../commons/functions");
const { affiliatesRepo } = require("../repositories");
const { catchInternalError, createSingleResponse, sendSuccessResponse, sendInvalidInputResponse } = require("./controller-commons/functions");

const catchAvatarMid = multer().single("avatar");
module.exports = Object.freeze({
    signUp: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const verificationToken = await affiliatesRepo.signUp(req.body);
                res.json({ verificationToken });
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
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
                    case rc.unauthorized:
                        res.status(sc.unauthorized).json(createSingleResponse(error.message));
                        break;
                    case rc.timeout:
                        res.status(sc.timeout).json(createSingleResponse(error.message));
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
                            res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
                        } else {
                            if (!utils.isImageMime(req.file.mimetype)) {
                                res.status(sc.invalidInput).json(createSingleResponse(rt.invalidFileFormat));
                            } else {
                                const imageReadStream = streamifier.createReadStream(imageBuffer);
                                try {
                                    const avatar = await affiliatesRepo.updateAvatar({ userId, imageReadStream });
                                    res.json({ avatar });
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
                            }
                        }
                    }
                });
            });

        });
    },
    deleteAvatar: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            try {
                await affiliatesRepo.deleteAvatar({ userId });
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
    getOne: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            try {
                const affiliate = await affiliatesRepo.getOne({ userId });
                res.json(affiliate);
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
            const { userId } = req.params;
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
    getTransactions: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const getManyQueries = req.query;
            try {
                const transactions = await affiliatesRepo.getTransactions({ userId, getManyQueries });
                res.json(transactions);
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
    updatePasswordHash: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const { oldPasswordHash, newPasswordHash } = req.body;
            try {
                await affiliatesRepo.updatePasswordHash({ userId, oldPasswordHash, newPasswordHash });
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
    updateEmail: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const { newEmail } = req.body;
            try {
                const verificationToken = await affiliatesRepo.updateEmail({ userId, newEmail });
                res.json({ verificationToken });
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
    verifyEmail: (req, res) => {
        catchInternalError(res, async () => {
            try {
                await affiliatesRepo.verifyEmail(req.body);
                sendSuccessResponse(res);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.unauthorized:
                        res.status(sc.unauthorized).json(createSingleResponse(error.message));
                        break;
                    case rc.timeout:
                        res.status(sc.timeout).json(createSingleResponse(error.message));
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
    updatePhone: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const { newPhone } = req.body;
            try {
                await affiliatesRepo.updatePhone({ userId, newPhone });
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
    },
    updateFullName: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const { newFullName } = req.body;
            try {
                await affiliatesRepo.updateFullName({ userId, newFullName });
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
    delete: (req, res) => {
        catchInternalError(res, async () => {
            const { userId } = req.params;
            const { passwordHash } = req.body;
            try {
                await affiliatesRepo.delete({ userId, passwordHash });
                sendSuccessResponse(res);
            } catch (error) {
                switch (error.code) {
                    case rc.invalidInput:
                        res.status(sc.invalidInput).json(createSingleResponse(error.message));
                        break;
                    case rc.unauthorized:
                        res.status(sc.unauthorized).json(createSingleResponse(error.message));
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
});