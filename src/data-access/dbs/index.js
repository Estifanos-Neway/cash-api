require("dotenv").config();
const { makeDbConnector } = require("../db-connector");
const { makeAdminsDb } = require("./admins-db");
const { adminModel } = require("../db-models");
const {env} = require("../../env");
const jwtRefreshModel = require("../db-models/jwt-refresh-model");
const { makeJwtRefreshDb } = require("./jwt-refresh-db");

const dbConnector = makeDbConnector(env.DB_URL);

exports.adminsDb = makeAdminsDb(dbConnector, adminModel);
exports.jwtRefreshDb = makeJwtRefreshDb (dbConnector, jwtRefreshModel);
