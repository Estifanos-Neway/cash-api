import { Request, Response } from "express";

import { signInAdmin } from "../../repositories/admin";
import { errorHandler } from "../controller-commons";
import { singleResponse } from "../controller-commons/functions";
import { success, notFound } from "../controller-commons/variables";

function makeSigninAdminController(): (req: Request, res: Response) => Promise<void> {
    return async function signinAdminController(req, res): Promise<void> {
        const username: string = req.body.username;
        const passwordHash: string = req.body.passwordHash;
        try {
            const adminSignedIn: Boolean = await signInAdmin(username, passwordHash);
            if (adminSignedIn) {
                // TODO: add JWT
                res.end(singleResponse(success));
            } else {
                res.status(404).end(singleResponse(notFound));
            }
        } catch (error:any) {
            errorHandler(error, res);
        }
    };
};

export {
    makeSigninAdminController
}