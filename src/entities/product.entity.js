const _ = require("lodash");
const Image = require("./image.entity");
const { hasValue, removeUndefined } = require("../commons/functions");

module.exports = class Product {
    productId;
    #productName;
    #description;
    #mainImage;
    #moreImages;
    price;
    commissionRate;
    categories;
    published;
    featured;
    topSeller;
    viewCount;
    #createdAt;
    #updatedAt;

    set productName(productName) {
        this.#productName = productName?.trim();
    }

    get productName() {
        return this.#productName;
    }

    set description(description) {
        this.#description = description?.trim();
    }

    get description() {
        return this.#description;
    }

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
        description,
        mainImage,
        moreImages,
        price,
        commissionRate,
        categories,
        published,
        featured,
        topSeller,
        viewCount,
        createdAt,
        updatedAt }) {
        this.productId = productId;
        this.productName = productName;
        this.description = description;
        this.mainImage = mainImage;
        this.moreImages = moreImages;
        this.price = price;
        this.commissionRate = commissionRate;
        this.categories = categories;
        this.published = published;
        this.featured = featured;
        this.topSeller = topSeller;
        this.viewCount = viewCount;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }

    toJson() {
        return removeUndefined(
            {
                productId: this.productId,
                productName: this.productName,
                description: this.description,
                mainImage: this.mainImage,
                moreImages: this.moreImages,
                price: this.price,
                commissionRate: this.commissionRate,
                categories: this.categories,
                published: this.published,
                featured: this.featured,
                topSeller: this.topSeller,
                viewCount: this.viewCount,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt
            }
        );
    }
};