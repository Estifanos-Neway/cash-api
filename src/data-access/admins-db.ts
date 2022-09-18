import { AdminsDb, DbConnector } from "./types";
import { exists } from "./db-commons/functions";
import { adminModel } from "./db-models";

function makeAdminsDb(dbConnector: DbConnector): AdminsDb {
    return Object.freeze({
        exists: async (doc) => exists(dbConnector, adminModel, doc),
    });
};

export {
    makeAdminsDb
};