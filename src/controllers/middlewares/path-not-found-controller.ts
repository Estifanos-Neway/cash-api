import { Request, Response } from "express";
import { singleResponse } from "../controller-commons/functions";
import { notFound } from "../controller-commons/variables";

function makePathNotFoundController(): (req: Request, res: Response) => void {
    return function pathNotFound(req, res): void {
        res.status(404).end(singleResponse(notFound));
    };
};

export {
    makePathNotFoundController
}