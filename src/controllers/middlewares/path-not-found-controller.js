const { singleResponse } = require("../controller-commons/functions");
const { notFound } = require("../controller-commons/variables");

exports.makePathNotFoundController = function () {
    return function pathNotFound(req, res) {
        res.status(404).end(singleResponse(notFound));
    };
};