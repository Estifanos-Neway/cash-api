const _ = require("lodash");
const { isNonEmptyString } = require("../commons/functions");
const rt= require("../commons/response-texts");
const {productCategoriesRepo} = require("../repositories");
const { sendRequiredParamsNotFoundResponse, createSingleResponse, catchInternalError, sendInvalidInputResponse, sendSuccessResponse } = require("./controller-commons/functions");

module.exports = Object.freeze({
    create: (req, res) => {
        catchInternalError(res, async () => {
            const { categoryName } = req.body;
            if (_.isUndefined(categoryName)) {
                sendRequiredParamsNotFoundResponse(res);
            } else if (!isNonEmptyString(categoryName)) {
                sendInvalidInputResponse(res);
            } else {
                try {
                    const categoryCreated = await productCategoriesRepo.create({ categoryName });
                    res.json(categoryCreated.toJson());
                } catch (error) {
                    if (error.message === rt.categoryNameAlreadyExist ) {
                        res.status(409).json(createSingleResponse(rt.categoryNameAlreadyExist ));
                    } else {
                        throw error;
                    }
                }

            }
        });
    },
    getMany: (req, res) => {
        catchInternalError(res, async () => {
            const categories = await productCategoriesRepo.getMany();
            res.json(categories.map(category => category.toJson()));
        });
    },
    update: (req, res) => {
        catchInternalError(res, async () => {
            const { categoryId } = req.params;
            const { categoryName } = req.body;
            if (!_.isUndefined(categoryName) && !isNonEmptyString(categoryName)) {
                sendInvalidInputResponse(res);
                return;
            }
            const categoryExist = await productCategoriesRepo.exists({ id: categoryId });
            if (!categoryExist) {
                res.status(404).json(createSingleResponse(rt.categoryNotFound ));
                return;
            }
            const uniqueCategoryName = await productCategoriesRepo.isUniqueCategoryName(categoryName, categoryId);
            if (!uniqueCategoryName) {
                res.status(409).json(createSingleResponse(rt.categoryNameAlreadyExist ));
            } else {
                const updatedCategory = await productCategoriesRepo.update(categoryId, req.body);
                res.json(updatedCategory.toJson());
            }
        });
    },
    delete: (req, res) => {
        catchInternalError(res, async () => {
            const { categoryId } = req.params;
            const categoryExist = await productCategoriesRepo.exists({ id: categoryId });
            if (!categoryExist) {
                res.status(404).json(createSingleResponse(rt.categoryNotFound ));
                return;
            } else {
                await productCategoriesRepo.delete(categoryId);
                sendSuccessResponse(res);
            }
        });
    }
});