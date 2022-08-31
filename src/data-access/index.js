require("dotenv").config();
const { makeDbConnector } = require("./db-connector");
const { makeAdminsDb } = require("./admins-db");

exports.adminsDb = makeAdminsDb(makeDbConnector(process.env.DB_URL));
