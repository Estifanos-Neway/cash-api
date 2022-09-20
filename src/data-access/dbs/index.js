require("dotenv").config();
const mongoose = require("mongoose");
const { makeDbConnector } = require("../db-connector");
const { makeAdminsDb } = require("./admins-db");
const { adminModel } = require("../db-models");
const { admin } = require("../../entities");
const { env } = require("../../env");
const jwtRefreshModel = require("../db-models/jwt-refresh-model");
const { makeJwtRefreshDb } = require("./jwt-refresh-db");
const { exists, deleteOne, count, create, findOne } = require("../db-commons/functions");
const { updateOne } = require("../db-commons/functions");

const dbConnector = makeDbConnector(mongoose, env.DB_URL);

exports.adminsDb = makeAdminsDb(admin, dbConnector, adminModel, exists, count, create, findOne, updateOne);
exports.jwtRefreshDb = makeJwtRefreshDb(dbConnector, jwtRefreshModel, exists, deleteOne, create);
