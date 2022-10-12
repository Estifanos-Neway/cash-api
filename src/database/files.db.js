const mongoose = require("mongoose");
const { pipe } = require("../commons/functions");
const { fileNotFoundResponseText } = require("../commons/response-texts");

module.exports = Object.freeze({
    bucketNames: { productImages: "product_images" },
    upload: async ({ readStream, fileName, bucketName }) => {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
        const writeStream = gridfsBucket.openUploadStream(fileName);
        await pipe(readStream, writeStream);
    },
    download: async ({ fileName, bucketName, writeStream }) => {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
        const readStream = gridfsBucket.openDownloadStreamByName(fileName);
        try {
            await pipe(readStream, writeStream);
        } catch (error) {
            if (/^FileNotFound/.test(error.message)) {
                throw new Error(fileNotFoundResponseText);
            } else {
                throw error;
            }
        }
    },
    delete: async (fileName, bucketName) => {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
        const file = await gridfsBucket.find({ filename: fileName }).next();
        if (file) {
            await gridfsBucket.delete(file._id);
        }
    }
});