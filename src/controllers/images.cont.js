/* eslint-disable indent */
const rt = require("../commons/response-texts");
const rc = require("../commons/response-codes");
const sc = require("./controller-commons/status-codes");
const { filesRepo } = require("../repositories");
const { createSingleResponse, catchInternalError } = require("./controller-commons/functions");

module.exports = {
    downloadProductImage: async (req, res) => {
        catchInternalError(res, async () => {
            const fileName = req.params.fileName;
            try {
                await filesRepo.downloadProductImage(fileName, res);
            } catch (error) {
                if (error.message === rt.fileNotFound) {
                    res.status(404).json(createSingleResponse(rt.fileNotFound));
                } else {
                    throw error;
                }
            }
        });
    },
    getAvatar: async (req, res) => {
        catchInternalError(res, async () => {
            const fileName = req.params.fileName;
            try {
                await filesRepo.getAvatar({ fileName, writeStream: res });
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