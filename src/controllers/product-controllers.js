const _ = require("lodash");
const multer = require("multer");
const { hasSingleValue, isPositiveNumber, isNonEmptyString } = require("../commons/functions");
const { invalidInputResponseText } = require("../commons/response-texts");
const { createSingleResponse, errorHandler } = require("./controller-commons/functions");

const uploader = multer();
const uploaderMiddleware = uploader.fields([
    { name: "mainImage" },
    { name: "moreImages" }
]);

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
    uploaderMiddleware(req, res, (error) => {
        if (error && error.message !== "Unexpected field") {
            errorHandler(error, res);
        } else {
            req.body.price = Number.parseFloat(req.body.price) || undefined;
            req.body.commissionRate = Number.parseFloat(req.body.commissionRate) || undefined;
            req.body.viewCount = Number.parseFloat(req.body.viewCount) || undefined;
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
                // TODO:add images
                res.status(400).json(createSingleResponse(invalidInputResponseText));
                res.end();
            } else {
                next();
            }
        }
    });
}

exports.createProductCont = async (req, res) => {
    validateProductMid(req, res, () => {
        const { productName, price } = req.body;
        if (!_.isUndefined(productName) ||
            !_.isUndefined(price)) {
            res.status(400).json(createSingleResponse(invalidInputResponseText));
        } else {
            // 
        }
    });
};