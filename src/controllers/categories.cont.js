const _ = require("lodash");
const { isNonEmptyString } = require("../commons/functions");
const { categoryNameAlreadyExistResponseText, categoryNotFoundResponseText } = require("../commons/response-texts");
const categoriesRepo = require("../repositories/categories.repo");
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
                    const categoryCreated = await categoriesRepo.create({ categoryName });
                    res.json(categoryCreated.toJson());
                } catch (error) {
                    if (error.message === categoryNameAlreadyExistResponseText) {
                        res.status(409).json(createSingleResponse(categoryNameAlreadyExistResponseText));
                    } else {
                        throw error;
                    }
                }

            }
        });
    },
    getMany: (req, res) => {
        catchInternalError(res, async () => {
            const categories = await categoriesRepo.getMany();
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
            const categoryExist = await categoriesRepo.exists({ id: categoryId });
            if (!categoryExist) {
                res.status(404).json(createSingleResponse(categoryNotFoundResponseText));
                return;
            }
            const uniqueCategoryName = await categoriesRepo.isUniqueCategoryName(categoryName, categoryId);
            if (!uniqueCategoryName) {
                res.status(409).json(createSingleResponse(categoryNameAlreadyExistResponseText));
            } else {
                const updatedCategory = await categoriesRepo.update(categoryId, req.body);
                res.json(updatedCategory.toJson());
            }
        });
    },
    delete: (req, res) => {
        catchInternalError(res, async () => {
            const { categoryId } = req.params;
            const categoryExist = await categoriesRepo.exists({ id: categoryId });
            if (!categoryExist) {
                res.status(404).json(createSingleResponse(categoryNotFoundResponseText));
                return;
            } else {
                await categoriesRepo.delete(categoryId);
                sendSuccessResponse(res);
            }
        });
    }
});