const { removeUndefined } = require("../commons/functions");

module.exports = class {
    categoryId;
    categoryName;

    constructor({ categoryId, categoryName }) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    toJson() {
        return removeUndefined(
            {
                categoryId: this.categoryId,
                categoryName: this.categoryName
            }
        );
    }
};