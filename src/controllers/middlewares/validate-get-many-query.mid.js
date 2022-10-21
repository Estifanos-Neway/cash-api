const _ = require("lodash");
const rt = require("../../commons/response-texts");
const sc = require("../controller-commons/status-codes");
const conUtils = require("../controller-commons/functions");
const utils = require("../../commons/functions");

module.exports = ({ findManyDefaultLimit, findManyMaxLimit }) => {
    return (req, res, next) => {
        conUtils.catchInternalError(res, () => {
            let { search, filter, skip, limit, select, sort } = req.query;

            // search
            try {
                search = _.isUndefined(search) ? {} : JSON.parse(search);
            } catch (error) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidSearchQuery));
                res.end();
                return;
            }
            for (let key of Object.keys(search)) {
                search[key] = new RegExp(search[key].toString(), "i");
            }

            // filter
            try {
                filter = _.isUndefined(filter) ? {} : JSON.parse(filter);
            } catch (error) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidFilterQuery));
                res.end();
                return;
            }
            filter = { ...search, ...filter };
            req.query.filter = filter;

            // skip
            skip = _.isUndefined(skip) ? undefined : Number.parseInt(skip);
            if (!_.isUndefined(skip) && !utils.isPositiveNumber(skip)) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidSkipQuery));
                res.end();
                return;
            }
            req.query.skip = skip;

            // limit
            limit = _.isUndefined(limit) ? undefined : Number.parseInt(limit);
            if (!_.isUndefined(limit) && !utils.isPositiveNumber(limit)) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidLimitQuery));
                res.end();
                return;
            }
            limit = _.isUndefined(limit) ? findManyDefaultLimit : limit < findManyMaxLimit ? limit : findManyMaxLimit;
            req.query.limit = limit;

            // select
            try {
                select = _.isUndefined(select) ? [] : JSON.parse(select);
                if (!_.isArray(select)) {
                    throw new Error();
                } else {
                    for (const element of select) {
                        if (!_.isString(element)) {
                            throw new Error();
                        }
                    }
                }
            } catch (error) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidSelectQuery));
                res.end();
                return;
            }
            req.query.select = select;

            // sort
            try {
                sort = _.isUndefined(sort) ? {} : JSON.parse(sort);
                for (let key of Object.keys(sort)) {
                    if (sort[key] !== -1 && sort[key] !== 1) {
                        throw new Error();
                    }
                }
            } catch (error) {
                res.status(sc.invalidInput).json(conUtils.createSingleResponse(rt.invalidSortQuery));
                res.end();
                return;
            }
            req.query.sort = sort;

            next();
        });
    };
};