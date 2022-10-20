require("dotenv").config();

const environment = process.env;

exports.env = {
    JWT_SECRETE: environment.JWT_SECRETE,
    JWT_REFRESH_SECRETE: environment.JWT_REFRESH_SECRETE,
    API_KEY: environment.API_KEY,
    DB_URL: environment.DB_URL,
    DB_URL_TEST: environment.DB_URL_TEST,
    PORT: environment.PORT,
    EMAIL_FROM: environment.EMAIL_FROM,
    SMTP_URL: environment.SMTP_URL,
    PRIVATE_KEY: environment.PRIVATE_KEY,
};