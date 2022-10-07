const { notImplementedYetResponseText } = require("../../commons/response-texts");
const { createSingleResponse } = require("../controller-commons/functions");

exports.makeNotImplementedYet = () => {
    return (req, res) => {
        res.json(createSingleResponse(notImplementedYetResponseText));
    };
};