const rt = require("../../commons/response-texts");
const { createSingleResponse, catchInternalError } = require("../controller-commons/functions");

module.exports = (req, res) => {
    catchInternalError(res, () => {
        res.json(createSingleResponse(rt.notImplementedYet));
    });
};