const _ = require("lodash");
const Image = require("./entity-commons/image.model");
const { hasValue } = require("../commons/functions");

module.exports = class Product {
    productId;
    productName;
    #mainImage;
    #moreImages;
    price;
    commissionRate;
    categories;
    published;
    featured;
    viewCount;
    #createdAt;
    #updatedAt;

    set mainImage(jsonImage) {
        if (hasValue(jsonImage)) {
            this.#mainImage = new Image({ ...jsonImage });
        }
    }

    get mainImage() {
        return this.#mainImage?.toJson();
    }

    set moreImages(jsonImageArray) {
        if (_.isArray(jsonImageArray)) {
            this.#moreImages = [];
            for (let jsonImage of jsonImageArray) {
                this.#moreImages.push(new Image({ ...jsonImage }));
            }
        }
    }

    get moreImages() {
        if (_.isArray(this.#moreImages)) {
            const jsonImageArray = [];
            for (let image of this.#moreImages) {
                jsonImageArray.push(image.toJson());
            }
            return jsonImageArray;
        } else {
            return undefined;
        }
    }

    get createdAt() {
        return this.#createdAt;
    }

    get updatedAt() {
        return this.#updatedAt;
    }

    constructor({
        productId,
        productName,
        mainImage,
        moreImages,
        price,
        commissionRate,
        categories,
        published,
        featured,
        viewCount,
        createdAt,
        updatedAt }) {
        this.productId = productId;
        this.productName = productName;
        this.mainImage = mainImage;
        this.moreImages = moreImages;
        this.price = price;
        this.commissionRate = commissionRate;
        this.categories = categories;
        this.published = published;
        this.featured = featured;
        this.viewCount = viewCount;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }

    toJson() {
        return {
            productId: this.productId,
            productName: this.productName,
            mainImage: this.mainImage,
            moreImages: this.moreImages,
            price: this.price,
            commissionRate: this.commissionRate,
            categories: this.categories,
            published: this.published,
            featured: this.featured,
            viewCount: this.viewCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};