const _ = require("lodash");
const utils = require("../commons/functions");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const { sessionsDb } = require("../database");
const { User, Session } = require("../entities");

module.exports = {
    startSession: async ({ userId, userType }) => {
        const user = new User({ userId, userType });
        const refreshToken = user.createRefreshToken();
        const accessToken = user.createAccessToken();
        const session = new Session({ user: user.toJson(), refreshToken });
        await sessionsDb.create(session);
        return { refreshToken, accessToken };
    },
    validateGetManyQuery: ({getManyQueries, defaultLimit, maxLimit}) => {
        let { search, filter, skip, limit, select, sort } = getManyQueries;

        // search
        try {
            search = _.isUndefined(search) ? {} : JSON.parse(search);
        } catch (error) {
            throw utils.createError(rt.invalidSearchQuery, rc.invalidInput);
        }
        for (let key of Object.keys(search)) {
            search[key] = new RegExp(search[key].toString(), "i");
        }

        // filter
        try {
            filter = _.isUndefined(filter) ? {} : JSON.parse(filter);
        } catch (error) {
            throw utils.createError(rt.invalidFilterQuery, rc.invalidInput);
        }
        filter = { ...search, ...filter };
        getManyQueries.filter = filter;

        // skip
        skip = _.isUndefined(skip) ? 0 : Number.parseInt(skip);
        if (!_.isUndefined(skip) && !utils.isPositiveNumber(skip)) {
            throw utils.createError(rt.invalidSkipQuery, rc.invalidInput);
        }
        getManyQueries.skip = skip;

        // limit
        limit = _.isUndefined(limit) ? undefined : Number.parseInt(limit);
        if (!_.isUndefined(limit) && !utils.isPositiveNumber(limit)) {
            throw utils.createError(rt.invalidLimitQuery, rc.invalidInput);
        }
        limit = _.isUndefined(limit) ? defaultLimit : limit < maxLimit ? limit : maxLimit;
        getManyQueries.limit = limit;

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
            throw utils.createError(rt.invalidSelectQuery, rc.invalidInput);
        }
        getManyQueries.select = select;

        // sort
        try {
            sort = _.isUndefined(sort) ? {} : JSON.parse(sort);
            for (let key of Object.keys(sort)) {
                if (sort[key] !== -1 && sort[key] !== 1) {
                    throw new Error();
                }
            }
        } catch (error) {
            throw utils.createError(rt.invalidSortQuery, rc.invalidInput);
        }
        getManyQueries.sort = sort;
        return getManyQueries;
    }
};