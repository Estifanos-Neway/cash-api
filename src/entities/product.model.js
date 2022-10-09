const Image = require("./entity-commons/image.model");
const { hasValue } = require("../commons/functions");

module.exports = class Product {
    productName;
    #mainImage;
    #moreImages = [];
    price;
    commissionRate;
    categories = [];
    published = false;
    featured = false;
    viewCount = 0;

    set mainImage(jsonImage) {
        if (hasValue(jsonImage)) {
            this.#mainImage = new Image({ ...jsonImage });
        }
    }

    get mainImage() {
        return this.#mainImage?.toJson();
    }

    set moreImages(jsonImageArray) {
        if (hasValue(jsonImageArray)) {
            this.#moreImages = [];
            for (let jsonImage of jsonImageArray) {
                this.#moreImages.push(new Image({ ...jsonImage }));
            }
        }
    }

    get moreImages() {
        const jsonImageArray = [];
        for (let image of this.#moreImages) {
            jsonImageArray.push(image.toJson());
        }
        return jsonImageArray;
    }

    constructor({
        productName,
        mainImage,
        moreImages,
        price,
        commissionRate,
        categories,
        published,
        featured,
        viewCount }) {
        this.productName = productName;
        this.price = price;
        this.commissionRate = commissionRate;
        this.categories = categories;
        this.published = published;
        this.featured = featured;
        this.viewCount = viewCount;
        this.mainImage = mainImage;
        this.moreImages = moreImages;
    }

    toJson() {
        return {
            productName: this.productName,
            mainImage: this.mainImage,
            moreImages: this.moreImages,
            price: this.price,
            commissionRate: this.commissionRate,
            categories: this.categories,
            published: this.published,
            featured: this.featured,
            viewCount: this.viewCount
        };
    }
};