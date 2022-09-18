import { Mongoose } from "mongoose";

function dbConnector(): Promise<Mongoose>;

type AdminsDb = Readonly<{ exists: (doc: any) => Promise<Boolean> }>;
type DbConnector = typeof dbConnector;

export {
    DbConnector,
    AdminsDb
}