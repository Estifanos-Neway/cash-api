const _ = require("lodash");
const multer = require("multer");
const streamifier = require("streamifier");
const { hasSingleValue, isPositiveNumber, isNonEmptyString, createUid, isImageMime } = require("../commons/functions");
const rt = require("../commons/response-texts");
const { ordersDb } = require("../database");
const { User, Order } = require("../entities");
const { productsRepo, filesRepo } = require("../repositories");
const { createSingleResponse, sendInvalidInputResponse, sendInternalErrorResponse, sendSuccessResponse, catchInternalError } = require("./controller-commons/functions");

const mainImageName = "mainImage";
const moreImagesName = "moreImages";
const uploader = multer();
const parseFormMid = uploader.fields([
    {
        name: mainImageName,
        maxCount: 1
    },
    { name: moreImagesName }
]);

const productImageBasePath = "/images/products";

function isValidCategoryList(categoryList) {
    if (!_.isUndefined(categoryList)) {
        if (_.isArray(categoryList)) {
            for (let category of categoryList) {
                if (!isNonEmptyString(category)) {
                    return false;
                }
            }
        } else {
            return false;
        }
    }
    return true;
}

async function uploadProductImage(image) {
    const fileName = createUid();
    const fileReadStream = streamifier.createReadStream(image.buffer);
    await filesRepo.uploadProductImage(fileName, fileReadStream);
    return `${productImageBasePath}/${fileName}`;
}

async function uploadAttachedImagesMid(req, res, next) {
    catchInternalError(res, async () => {
        const mainImage = req.files?.[mainImageName]?.[0];
        if (mainImage) {
            if (isImageMime(mainImage.mimetype)) {
                const imagePath = await uploadProductImage(mainImage);
                req.body.mainImage = { path: imagePath };
            }
        }
        const moreImages = req.files?.[moreImagesName];
        if (_.isArray(moreImages) && !_.isEmpty(moreImages)) {
            req.body.moreImages = [];
            for (let image of moreImages) {
                if (isImageMime(image.mimetype)) {
                    const imagePath = await uploadProductImage(image);
                    req.body.moreImages.push({ path: imagePath }
                    );
                }
            }
        }
        await next();
    });
}

async function validateProductMid(req, res, next) {
    catchInternalError(res, async () => {
        parseFormMid(req, res, (error) => {
            catchInternalError(res, async () => {
                if (!error || error.message === "Unexpected field") {
                    try {
                        req.body = JSON.parse(req.body.productDetails);
                    } catch (error) {
                        res.status(400).json(createSingleResponse(rt.invalidJsonString));
                        return res.end();
                    }
                    req.body.description = req.body.description === "" ? null : req.body.description;
                    const {
                        productName,
                        description,
                        price,
                        categories,
                        commission,
                        published,
                        featured,
                        topSeller,
                        viewCount
                    } = req.body;
                    if (
                        (!_.isUndefined(productName) && !hasSingleValue(productName)) ||
                        (!_.isUndefined(description) && !_.isNull(description) && !hasSingleValue(description)) ||
                        (!_.isUndefined(price) && !isPositiveNumber(price)) ||
                        (!_.isUndefined(commission) && !isPositiveNumber(commission)) ||
                        !isValidCategoryList(categories) ||
                        (!_.isUndefined(published) && !_.isBoolean(published)) ||
                        (!_.isUndefined(featured) && !_.isBoolean(featured)) ||
                        (!_.isUndefined(topSeller) && !_.isBoolean(topSeller)) ||
                        (!_.isUndefined(viewCount) && !isPositiveNumber(viewCount))) {
                        sendInvalidInputResponse(res);
                        res.end();
                    } else {
                        const uniqueProductName = await productsRepo.isUniqueProductName(productName, req.params.productId);
                        if (!uniqueProductName) {
                            res.status(409).json(createSingleResponse(rt.productNameAlreadyExist));
                            res.end();
                        } else {
                            await next();
                        }
                    }
                } else {
                    if (error.message === "Unexpected end of form") {
                        sendInvalidInputResponse(res);
                    } else {
                        sendInternalErrorResponse(error, res);
                    }
                }

            });
        });
    });
}

module.exports = Object.freeze({
    create: async (req, res) => {
        catchInternalError(res, async () => {
            await validateProductMid(req, res, async () => {
                const { productName, price, commission } = req.body;
                if (_.isUndefined(productName) ||
                    _.isUndefined(price) ||
                    _.isUndefined(commission)) {
                    res.status(400).json(createSingleResponse(rt.requiredParamsNotFound));
                } else {
                    await uploadAttachedImagesMid(req, res, async () => {
                        try {
                            const createdProduct = await productsRepo.create(req.body);
                            res.json(createdProduct.toJson());
                        } catch (error) {
                            if (error.message === rt.productNameAlreadyExist) {
                                res.status(409).json(createSingleResponse(rt.productNameAlreadyExist));
                                res.end();
                            } else {
                                throw error;
                            }
                        }
                    });
                }
            });
        });
    },
    getMany: async (req, res) => {
        catchInternalError(res, async () => {
            let { filter, categories, skip, limit, select, sort } = req.query;
            sort = _.isEmpty(sort) ? { createdAt: -1 } : sort;

            try {
                categories = _.isUndefined(categories) ? [] : JSON.parse(categories);
                if (!_.isArray(categories)) {
                    throw new Error();
                } else {
                    for (const element of categories) {
                        if (!_.isString(element)) {
                            throw new Error();
                        }
                    }
                }
            } catch (error) {
                res.status(400).json(createSingleResponse(rt.invalidCategoriesQuery));
                return;
            }

            const products = await productsRepo.getMany({ filter, categories, skip, limit, select, sort });
            res.json(products.map(product => product.toJson()));
        });
    },
    count: async (req, res) => {
        catchInternalError(res, async () => {
            let { filter, categories } = req.query;

            try {
                categories = _.isUndefined(categories) ? [] : JSON.parse(categories);
                if (!_.isArray(categories)) {
                    throw new Error();
                } else {
                    for (const element of categories) {
                        if (!_.isString(element)) {
                            throw new Error();
                        }
                    }
                }
            } catch (error) {
                res.status(400).json(createSingleResponse(rt.invalidCategoriesQuery));
                return;
            }

            const count = await productsRepo.count({ filter, categories });
            res.json({ count });
        });
    },
    getOne: async (req, res) => {
        catchInternalError(res, async () => {
            const userType = req.user?.userType;
            const productId = req.params.productId;
            const product = await productsRepo.getOne(productId, userType !== User.userTypes.Admin);
            if (product === null) {
                res.status(404).json(createSingleResponse(rt.productNotFound));
            } else {
                res.json(product.toJson());
            }
        });
    },
    update: async (req, res) => {
        catchInternalError(res, async () => {
            const productId = req.params.productId;
            const productExist = await productsRepo.exists({ id: productId });
            if (!productExist) {
                res.status(404).json(createSingleResponse(rt.productNotFound));
            } else {
                await validateProductMid(req, res, async () => {
                    await uploadAttachedImagesMid(req, res, async () => {
                        const updatedProduct = await productsRepo.update(productId, req.body);
                        res.json(updatedProduct.toJson());
                    });
                });
            }
        });
    },
    delete: async (req, res) => {
        catchInternalError(res, async () => {
            const productId = req.params.productId;
            const productExist = await productsRepo.exists({ id: productId });
            if (!productExist) {
                res.status(404).json(createSingleResponse(rt.productNotFound));
            } else {
                const ordersExist = await ordersDb.exists({ "product.productId": productId, status: Order.statuses.Pending });
                if (ordersExist) {
                    res.status(409).json(createSingleResponse(rt.pendingOrder));
                } else {
                    await productsRepo.delete({ id: productId });
                    sendSuccessResponse(res);
                }
            }
        });
    }
});