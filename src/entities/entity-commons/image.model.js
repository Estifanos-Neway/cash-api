module.exports = class Image {
    path;
    constructor({ path }) {
        this.path = path;
    }

    toJson() {
        return {
            path: this.path
        };
    }
};