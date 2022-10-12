const { filesDb } = require("../database");

const productImagesBucketName = filesDb.bucketNames.productImages;

module.exports = Object.freeze({
    uploadProductImage: async (fileName, readStream) => {
        await filesDb.upload({ readStream, fileName, bucketName: productImagesBucketName });
    },
    downloadProductImage: async (fileName, writeStream) => {
        await filesDb.download({ fileName, bucketName: productImagesBucketName, writeStream });
    }
});