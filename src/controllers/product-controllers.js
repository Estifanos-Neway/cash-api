const _ = require("lodash");
const { hasSingleValue, isPositiveNumber, isNonEmptyString } = require("../commons/functions");
const { invalidInputResponseText } = require("../commons/response-texts");
const { createSingleResponse } = require("./controller-commons/functions");

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

exports.createProductCont = (req, res) => {
    const {
        productName,
        price,
        commissionRate,
        categories,
        published,
        featured,
        viewCount } = req.body;

    if (
        !hasSingleValue(productName) ||
        !isPositiveNumber(price) ||
        (!_.isUndefined(commissionRate) && !(_.isNumber(commissionRate) && commissionRate >= 0 && commissionRate <= 100)) ||
        !isValidCategoryList(categories) ||
        (!_.isUndefined(published) && !_.isBoolean(published)) ||
        (!_.isUndefined(featured) && !_.isBoolean(featured)) ||
        (!_.isUndefined(featured) && !isPositiveNumber(viewCount))) {
        res.status(400).json(createSingleResponse(invalidInputResponseText));
    } else {
        // 
    }
};