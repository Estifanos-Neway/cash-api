import { adminsDb } from "../../data-access";
import { makeSigninAdmin } from "./signin-admin";

const signInAdmin = makeSigninAdmin(adminsDb);

export {
    signInAdmin
}