import { Router } from "express";
import { makeAdminRouter } from "./admin-router";

export const adminRouter: Router = makeAdminRouter();