import {env} from "../env";
import { makeDbConnector } from "./db-connector";
import { makeAdminsDb } from "./admins-db";

// @ts-ignore
const adminsDb = makeAdminsDb(makeDbConnector(env.DB_URL));

export {
    adminsDb
}
