import express, { Router } from "express";
import { signinAdminController } from "../controllers/admin";

export function makeAdminRouter(): Router {
    const adminRouter: Router = express.Router();
    adminRouter.post("/signin", signinAdminController);
    return adminRouter;
};