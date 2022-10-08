const _ = require("lodash");
const { userNotFoundResponseText } = require("../commons/response-texts");
const { productsDb } = require("../database");
const Product = require("../entities/product.model");
const { getAdminSettingsRepo } = require("./admin-repositories");

exports.createProductRepo = async ({ jsonProduct }) => {
    if (_.isUndefined(jsonProduct.commissionRate)) {
        const adminSetting = await getAdminSettingsRepo();
        if (adminSetting) {
            jsonProduct.commissionRate = jsonProduct.price * (adminSetting.commissionRate / 100);
        } else {
            throw new Error(userNotFoundResponseText);
        }
    }
    const product = new Product({ ...jsonProduct });
    return await productsDb.create(product);
};