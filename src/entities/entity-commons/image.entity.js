const { removeUndefined } = require("../../commons/functions");

module.exports = class Image {
    path;
    constructor({ path }) {
        this.path = path;
    }

    toJson() {
        return removeUndefined(
            {
                path: this.path
            }
        );
    }
};