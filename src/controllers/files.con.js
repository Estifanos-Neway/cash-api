/* eslint-disable indent */
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { filesRepo } = require("../repositories");
const { createSingleResponse, catchInternalError } = require("./controller-commons/functions");
module.exports = {
    download: async (req, res) => {
        catchInternalError(res, async () => {
            const collectionName = req.params.collectionName;
            const fileName = req.params.fileName;
            try {
                await filesRepo.read({ collectionName, fileName, writeStream: res });
            } catch (error) {
                switch (error.code) {
                    case rc.notFound:
                        res.status(sc.notFound).json(createSingleResponse(error.message));
                        break;
                    default:
                        throw error;
                }
            }
        });
    }
};