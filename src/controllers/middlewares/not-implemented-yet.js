const { notImplementedYetResponseText } = require("../../commons/response-texts");
const { createSingleResponse } = require("../controller-commons/functions");

module.exports = (req, res) => {
    res.json(createSingleResponse(notImplementedYetResponseText));
};