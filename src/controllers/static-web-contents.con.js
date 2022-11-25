/* eslint-disable indent */
const { staticWebContentsRepo } = require("../repositories");
const { catchInternalError, createSingleResponse, createCatchSingleImageMid } = require("./controller-commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");

module.exports = Object.freeze({
    get: (req, res) => {
        catchInternalError(res, async () => {
            const getManyQueries = req.query;
            const staticWebContents = await staticWebContentsRepo.get({ getManyQueries });
            res.json(staticWebContents);
        });
    },
    updateLogoImage: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "logoImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    if (!imageReadStream) {
                        res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
                    } else {
                        try {
                            const staticWebContents = await staticWebContentsRepo.updateLogoImage({ imageReadStream });
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
                    }
                });
            });
        });
    },
    updateHero: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "heroImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    try {
                        const staticWebContents = await staticWebContentsRepo.updateHero({ heroImageReadStream: imageReadStream, ...req.body });
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
            });
        });
    },
    updateAboutUsImage: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "aboutUsImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    if (!imageReadStream) {
                        res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
                    } else {
                        try {
                            const staticWebContents = await staticWebContentsRepo.updateAboutUsImage({ imageReadStream });
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
                    }
                });
            });
        });
    },
    updateWhyUs: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "whyUsImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    try {
                        const staticWebContents = await staticWebContentsRepo.updateWhyUs({ whyUsImageReadStream: imageReadStream, ...req.body });
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
            });
        });
    },
    updateWhatMakesUsUnique: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const staticWebContents = await staticWebContentsRepo.updateWhatMakesUsUnique(req.body);
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
    updateWhoAreWe: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "whoAreWeImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    try {
                        const staticWebContents = await staticWebContentsRepo.updateWhoAreWe({ whoAreWeImageReadStream: imageReadStream, ...req.body });
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
            });
        });
    },
    updateHowTos: (req, res) => {
        catchInternalError(res, async () => {
            try {
                const staticWebContents = await staticWebContentsRepo.updateHowTos(req.body);
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
    addBrand: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "logoImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    if (!imageReadStream) {
                        res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
                    } else {
                        try {
                            const staticWebContents = await staticWebContentsRepo.addBrand({ brandLogoImageReadStream: imageReadStream, ...req.body });
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
                    }
                });
            });
        });
    },
    updateBrand: (req, res) => {
        catchInternalError(res, async () => {
            const id = req.params.id;
            const imageFieldName = "logoImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    try {
                        const staticWebContents = await staticWebContentsRepo.updateBrand({ id, brandLogoImageReadStream: imageReadStream, ...req.body });
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
            });
        });
    },
    deleteBrand: (req, res) => {
        catchInternalError(res, async () => {
            const id = req.params.id;
            const staticWebContents = await staticWebContentsRepo.deleteBrand({ id });
            res.json(staticWebContents);
        });
    },
    addSocialLink: (req, res) => {
        catchInternalError(res, async () => {
            const imageFieldName = "logoImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    if (!imageReadStream) {
                        res.status(sc.invalidInput).json(createSingleResponse(rt.requiredParamsNotFound));
                    } else {
                        try {
                            const staticWebContents = await staticWebContentsRepo.addSocialLink({ socialLinkLogoImageReadStream: imageReadStream, ...req.body });
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
                    }
                });
            });
        });
    },
    updateSocialLink: (req, res) => {
        catchInternalError(res, async () => {
            const id = req.params.id;
            const imageFieldName = "logoImage";
            const catchSingleImageMid = createCatchSingleImageMid({ imageFieldName });
            catchSingleImageMid(req, res, (imageReadStream) => {
                catchInternalError(res, async () => {
                    try {
                        const staticWebContents = await staticWebContentsRepo.updateSocialLink({ id, socialLinkLogoImageReadStream: imageReadStream, ...req.body });
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
            });
        });
    },
    deleteSocialLink: (req, res) => {
        catchInternalError(res, async () => {
            const id = req.params.id;
            const staticWebContents = await staticWebContentsRepo.deleteSocialLink({ id });
            res.json(staticWebContents);
        });
    }
});