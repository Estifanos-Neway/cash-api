import mongoose from "mongoose";
import { DbConnector } from "./types";

function makeDbConnector(dbUrl: string): DbConnector {
    return async function dbConnector() {
        await mongoose.connect(dbUrl);
        return mongoose;
    };
};

export {
    makeDbConnector
}