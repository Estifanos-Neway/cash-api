import _ from "lodash";
import { invalidInputPrefix, requiredParamsNotFound } from "../commons/variables";
import { Admin } from "./types";

export function makeAdmin():
    (username: string, passwordHash: string) =>
        Admin {
    return function admin(username, passwordHash) {
        if (_.isUndefined(username) || _.isUndefined(passwordHash)) {
            throw new Error(`${invalidInputPrefix}${requiredParamsNotFound}:(username and passwordHash)`);
        } else {
            return Object.freeze({
                username,
                passwordHash
            });
        }
    };
};