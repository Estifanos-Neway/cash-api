import dotenv from "dotenv"
dotenv.config();

export const env = {
    DB_URL : process.env.DB_URL,
    PORT: process.env.PORT
}