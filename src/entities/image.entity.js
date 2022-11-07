const utils = require("../commons/functions");

module.exports = class Image {
    // #path
    #path;
    set path(path) {
        this.#path = utils.trim(path);
    }
    get path() {
        return this.#path;
    }
    constructor({ path }) {
        this.path = path;
    }

    toJson() {
        return utils.removeUndefined(
            {
                path: this.path
            }
        );
    }
};