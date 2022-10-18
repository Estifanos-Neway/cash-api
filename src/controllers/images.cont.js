const rt = require("../commons/response-texts");
const { filesRepo } = require("../repositories");
const { createSingleResponse, catchInternalError } = require("./controller-commons/functions");

exports.downloadProductImagesCont = async (req, res) => {
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
};