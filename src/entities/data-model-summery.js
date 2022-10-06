const required = true;
const image = {
    url: {
        type: "String",
        required
    }
};
// eslint-disable-next-line no-unused-vars
const dataModelSummery = {
    admin: {
        userId: {
            type: "String",
            required
        },
        username: {
            type: "String",
            required
        },
        email: {
            type: "String",
        },
        setting: {
            type: "Object",
            required,
            properties: {
                commissionRate: {
                    type: "Double",
                    required
                }
            }
        }
    },
    product: {
        productId: {
            type: "String",
            required
        },
        productName: {
            type: "String",
            required
        },
        mainImage: {
            type: "Object",
            required,
            properties: {
                ...image
            }
        },
        moreImages: {
            type: "array",
            elements: {
                type: "Object",
                properties: {
                    ...image
                }
            },
        },
        price: {
            type: "Double",
            required
        },
        commission: {
            type: "Double",
            required
        },
        published: {
            type: "Boolean",
            required
        },
        featured: {
            type: "Boolean",
            required
        },
        viewCount: {
            type: "Integer",
            required
        }
    }
};

/**
 * Name
Image
More images
Price
Description
Publish or not option
Feature or not
Commission (prefilled using the commission rate from the setting)
Others

 */