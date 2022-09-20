require("dotenv").config();

const environment = process.env;

exports.env = {
    DB_URL: environment.DB_URL,
    PORT: environment.PORT,
    JWT_SECRETE: environment.JWT_SECRETE,
    JWT_REFRESH_SECRETE: environment.JWT_REFRESH_SECRETE,
};