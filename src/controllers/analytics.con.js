const { analyticsRepo } = require("../repositories");
const { catchInternalError } = require("./controller-commons/functions");

module.exports = {
    getCounts: (req, res) => {
        catchInternalError(res, async () => {
            const analytics = await analyticsRepo.getCounts();
            res.json(analytics);
        });
    }
};