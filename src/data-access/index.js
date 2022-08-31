require("dotenv").config();
const dbConnector = require("./db-connector");
const adminsDb = require("./admins-db");

exports.adminsDb = adminsDb(dbConnector(process.env.DB_URL));
