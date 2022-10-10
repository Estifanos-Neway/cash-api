const _ = require("lodash");
const multer = require("multer");
const streamifier = require("streamifier");
const { hasSingleValue, isPositiveNumber, isNonEmptyString, createUid, isImageMime } = require("../commons/functions");
const { productNameAlreadyExistResponseText, requiredParamsNotFoundResponseText, productNotFoundResponseText, invalidFilterQueryResponseText, invalidSearchQueryResponseText, invalidSortQueryResponseText, invalidSkipQueryResponseText, invalidLimitQueryResponseText, invalidCategoriesQueryResponseText } = require("../commons/response-texts");
const { commissionRate } = require("../database/db-models/db-model.commons");
const { uploadProductImagesRepo } = require("../repositories/file-repositories");
const { isUniqueProductName, createProductRepo, getProductsRepo, getProductRepo } = require("../repositories/product.repo");
const { createSingleResponse, sendInvalidInputResponse, sendInternalError } = require("./controller-commons/functions");

const mainImageName = "mainImage";
const moreImagesName = "moreImages";
const uploader = multer();
const uploaderMiddleware = uploader.fields([
    {
        name: mainImageName,
        maxCount: 1
    },
    { name: moreImagesName }
]);

const productImageBasePath = "/images/products";

async function uploadProductImage(image) {
    const fileName = createUid();
    const fileReadStream = streamifier.createReadStream(image.buffer);
    await uploadProductImagesRepo(fileName, fileReadStream);
    return `${productImageBasePath}/${fileName}`;

}

async function uploadAttachedImages(req, res, next) {
    const mainImage = req.files?.[mainImageName]?.[0];
    if (mainImage) {
        if (isImageMime(mainImage.mimetype)) {
            const imagePath = await uploadProductImage(mainImage);
            req.body.mainImage = { path: imagePath };
        }
    }
    const moreImages = req.files?.[moreImagesName];
    if (_.isArray(moreImages)) {
        req.body.moreImages = [];
        for (let image of moreImages) {
            if (isImageMime(image.mimetype)) {
                const imagePath = await uploadProductImage(image);
                req.body.moreImages.push({ path: imagePath }
                );
            }
        }
    }
    next();
}

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

function validateProductMid(req, res, next) {
    uploaderMiddleware(req, res, async (error) => {
        if (error && error.message !== "Unexpected field") {
            sendInternalError(error, res);
        } else {
            try {
                req.body = JSON.parse(req.body.productDetails);
            } catch (error) {
                res.status(400).json(createSingleResponse("Invalid_Json"));
                return res.end();
            }
            const {
                productName,
                price,
                categories,
                commissionRate,
                published,
                featured,
                viewCount
            } = req.body;
            if (
                (!_.isUndefined(productName) && !hasSingleValue(productName)) ||
                (!_.isUndefined(price) && !isPositiveNumber(price)) ||
                (!_.isUndefined(commissionRate) && !(_.isNumber(commissionRate) && commissionRate >= 0 && commissionRate <= 100)) ||
                !isValidCategoryList(categories) ||
                (!_.isUndefined(published) && !_.isBoolean(published)) ||
                (!_.isUndefined(featured) && !_.isBoolean(featured)) ||
                (!_.isUndefined(featured) && !isPositiveNumber(viewCount))) {
                sendInvalidInputResponse(res);
                res.end();
            } else {
                const uniqueProductName = await isUniqueProductName(productName, req.params.productId);
                if (!uniqueProductName) {
                    res.status(400).json(createSingleResponse(productNameAlreadyExistResponseText));
                    res.end();
                } else {
                    next();
                }
            }
        }
    });
}

exports.createProductCont = async (req, res) => {
    try {
        validateProductMid(req, res, () => {
            const { productName, price } = req.body;
            if (_.isUndefined(productName) ||
                _.isUndefined(price) ||
                _.isUndefined(commissionRate)) {
                res.status(400).json(createSingleResponse(requiredParamsNotFoundResponseText));
            } else {
                uploadAttachedImages(req, res, async () => {
                    const createdProduct = await createProductRepo(req.body);
                    res.json(createdProduct.toJson());
                });
            }
        });
    } catch (error) {
        sendInternalError(error, res);
    }
};

exports.getProductsCont = async (req, res) => {
    try {
        let { search, filter, categories, skip, limit, sort } = req.query;

        try {
            search = _.isUndefined(search) ? {} : JSON.parse(search);
        } catch (error) {
            res.status(400).json(createSingleResponse(invalidSearchQueryResponseText));
            return;
        }
        for (let key of Object.keys(search)) {
            search[key] = new RegExp(search[key].toString());
        }

        try {
            filter = _.isUndefined(filter) ? {} : JSON.parse(filter);
        } catch (error) {
            res.status(400).json(createSingleResponse(invalidFilterQueryResponseText));
            return;
        }
        filter = { ...search, ...filter };

        try {
            categories = _.isUndefined(categories) ? [] : JSON.parse(categories);
            if (!_.isArray(categories)) {
                throw new Error();
            }
        } catch (error) {
            res.status(400).json(createSingleResponse(invalidCategoriesQueryResponseText));
            return;
        }

        skip = _.isUndefined(skip) ? undefined : Number.parseInt(skip);
        if (!_.isUndefined(skip) && !isPositiveNumber(skip)) {
            res.status(400).json(createSingleResponse(invalidSkipQueryResponseText));
            return;
        }

        limit = _.isUndefined(limit) ? undefined : Number.parseInt(limit);
        if (!_.isUndefined(limit) && !isPositiveNumber(limit)) {
            res.status(400).json(createSingleResponse(invalidLimitQueryResponseText));
            return;
        }

        try {
            sort = _.isUndefined(sort) ? {} : JSON.parse(sort);
            for (let key of Object.keys(sort)) {
                if (sort[key] !== -1 && sort[key] !== 1) {
                    throw new Error();
                }
            }
        } catch (error) {
            res.status(400).json(createSingleResponse(invalidSortQueryResponseText));
            return;
        }

        const products = await getProductsRepo({ filter, categories, skip, limit, sort });
        const jsonProducts = [];
        for (let product of products) {
            jsonProducts.push(product.toJson());
        }
        res.json(jsonProducts);
    } catch (error) {
        sendInternalError(error, res);
    }
};

exports.getProductCont = async (req, res) => {
    try {
        const userType = req.user?.userType;
        const productId = req.params.productId;
        const product = await getProductRepo(productId, userType !== "admin");
        if (product === null) {
            res.status(404).json(createSingleResponse(productNotFoundResponseText));
        } else {
            res.json(product.toJson());
        }
    } catch (error) {
        sendInternalError(error, res);
    }
};