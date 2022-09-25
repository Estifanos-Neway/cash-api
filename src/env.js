require("dotenv").config();

const environment = process.env;

exports.env = {
    DB_URL: environment.DB_URL,
    PORT: environment.PORT,
    JWT_SECRETE: environment.JWT_SECRETE,
    JWT_REFRESH_SECRETE: environment.JWT_REFRESH_SECRETE,
    API_KEY: environment.API_KEY,
    CORS_WHITE_LIST: environment.CORS_WHITE_LIST
};