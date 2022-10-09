const { filesDb } = require("../database");

const productImagesBucketName = "product_images";

exports.uploadProductImagesRepo = async (fileName, readStream) => {
    await filesDb.upload({ readStream, fileName, bucketName: productImagesBucketName });
};

exports.downloadProductImagesRepo = async (fileName, writeStream) => {
    await filesDb.download({ fileName, bucketName: productImagesBucketName, writeStream });
};