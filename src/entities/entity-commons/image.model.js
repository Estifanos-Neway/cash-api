module.exports = class Image {
    url;
    constructor({ url }) {
        this.url = url;
    }

    toJson() {
        return {
            url: this.url
        };
    }
};