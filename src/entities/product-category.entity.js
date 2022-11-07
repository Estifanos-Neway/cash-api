const utils = require("../commons/functions");

module.exports = class {
    // #categoryId
    #categoryId;
    set categoryId(categoryId) {
        this.#categoryId = utils.trim(categoryId);
    }
    get categoryId() {
        return this.#categoryId;
    }

    // #categoryName
    #categoryName;
    set categoryName(categoryName) {
        this.#categoryName = utils.trim(categoryName);
    }
    get categoryName() {
        return this.#categoryName;
    }

    constructor({ categoryId, categoryName }) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    toJson() {
        return utils.removeUndefined(
            {
                categoryId: this.categoryId,
                categoryName: this.categoryName
            }
        );
    }
};