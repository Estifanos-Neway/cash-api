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
        commissionRate: {
            type: "Double",
            required
        },
        categories:{
            type:"array",
            elements:{
                type:"String"
            }
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