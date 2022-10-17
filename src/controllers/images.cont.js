const { fileNotFoundResponseText } = require("../commons/response-texts");
const { filesRepo } = require("../repositories");
const { createSingleResponse, catchInternalError } = require("./controller-commons/functions");

exports.downloadProductImagesCont = async (req, res) => {
    catchInternalError(res, async () => {
        const fileName = req.params.fileName;
        try {
            await filesRepo.downloadProductImage(fileName, res);
        } catch (error) {
            if (error.message === fileNotFoundResponseText) {
                res.status(404).json(createSingleResponse(fileNotFoundResponseText));
            } else {
                throw error;
            }
        }
    });
};