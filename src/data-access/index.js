const { makeDbConnector } = require("./db-connector");
const { makeAdminsDb } = require("./dbs/admins-db");
const { adminModel } = require("./db-models");
const { Admin } = require("../entities");
const { env } = require("../env");
const jwtRefreshModel = require("./db-models/jwt-refresh-model");
const { makeJwtRefreshDb } = require("./dbs/jwt-refresh-db");

const dbConnector = makeDbConnector(env.DB_URL);

exports.adminsDb = makeAdminsDb(Admin, dbConnector, adminModel);
exports.jwtRefreshDb = makeJwtRefreshDb(dbConnector, jwtRefreshModel);
