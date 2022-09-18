import { Mongoose } from "mongoose";

export function dbConnector(): Promise<Mongoose>;

export type DbConnector = typeof dbConnector;