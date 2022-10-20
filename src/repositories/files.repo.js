const { filesDb } = require("../database");
const utils = require("../commons/functions");
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");

const productImagesBucketName = filesDb.bucketNames.productImages;

module.exports = Object.freeze({
    uploadProductImage: async (fileName, readStream) => {
        await filesDb.upload({ readStream, fileName, bucketName: productImagesBucketName });
    },
    downloadProductImage: async (fileName, writeStream) => {
        await filesDb.download({ fileName, bucketName: productImagesBucketName, writeStream });
    },
    getAvatar: async ({fileName, writeStream}) => {
        const bucketName = filesDb.bucketNames.avatars;
        try {
            await filesDb.download({ fileName, bucketName, writeStream });
            return true;
        } catch (error) {
            if (error.message === rt.fileNotFound) {
                throw utils.createError(rt.fileNotFound, rc.notFound);
            } else {
                throw error;
            }
        }
    }
});