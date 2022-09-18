import { Response } from "express";

import _ from "lodash";
import { invalidInputPrefix } from "../../commons/variables";
import { singleResponse } from "./functions";
import { internalError } from "./variables";

export function makeErrorHandler(): (error: any, res: Response) => void {
    return function errorHandler(error, res): void {
        const errorMessage: string | undefined = error.message;
        if (errorMessage !== undefined && errorMessage.startsWith(invalidInputPrefix)) {
            res.status(400).end(singleResponse(errorMessage.slice(invalidInputPrefix.length)));
        } else {
            console.dir(error, { depth: null });
            res.status(500).end(singleResponse(internalError));
        }
    };
};