import { AdminsDb } from "../../data-access/types";
import { admin } from "../../entities";
import { Admin } from "../../entities/types";

export function makeSigninAdmin(adminsDb: AdminsDb): (username: string, passwordHash: string) => Promise<Boolean> {
    return async function signinAdmin(username, passwordHash) {
        const adminToSignin: Admin = admin(username, passwordHash);
        return await adminsDb.exists({ username: adminToSignin.username, passwordHash: adminToSignin.passwordHash });
    };
};