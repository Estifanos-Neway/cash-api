exports.makeProduct = () => {
    return class product {
        #productName;
        #mainImage;
        #moreImages;
        #price;
        #commission;
        #published;
        #featured;
        #viewCount;

        get productName(){
            return this.#productName;
        }
    };
};