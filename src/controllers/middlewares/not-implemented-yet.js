const { notImplementedYetResponseText } = require("../../commons/variables");
const { createSingleResponse } = require("../controller-commons/functions");

exports.makeNotImplementedYet = () => {
    return (req, res) => {
        res.end(createSingleResponse(notImplementedYetResponseText));
    };
};