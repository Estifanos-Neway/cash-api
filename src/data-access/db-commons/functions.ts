import { DbConnector } from "../types";

// async function getOne(dbConnector, model, condition) {
//     await dbConnector();
//     return await model.getOne(condition);
// }


async function exists(dbConnector: DbConnector, model: any, condition: any): Promise<Boolean> {
    await dbConnector();
    return !!(await model.exists(condition));
}

export {
    // getOne,
    exists
};