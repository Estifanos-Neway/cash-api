const { Session } = require("../entities");
const { sessionDbModel } = require("./db-models");
const { db } = require("./db.commons");

const idName = "sessionId";
module.exports = Object.freeze({
    exists: async (conditions) => {
        const docWithId = await db.exists(sessionDbModel, conditions);
        if (docWithId) {
            return { [idName]: docWithId._id.toString() };
        } else {
            return false;
        }
    },
    count: async (conditions) => await db.count(sessionDbModel, conditions),
    create: async (session) => {
        const sessionDoc = await db.create(sessionDbModel, session.toJson());
        return db.adaptEntity(Session, sessionDoc, idName);

    },
    findOne: async (conditions, select) => {
        const sessionDoc = await db.findOne(sessionDbModel, conditions, select);
        return sessionDoc ? db.adaptEntity(Session, sessionDoc, idName) : null;
    },
    findMany: async ({ filter = {}, select = [], skip = 0, limit, sort = {} }) => {
        const sessionDocList = await db.findMany({ model: sessionDbModel, filter, skip, limit, select, sort });
        return sessionDocList.map(sessionDoc => db.adaptEntity(Session, sessionDoc, idName));
    },
    updateOne: async (conditions, updates) => {
        const sessionDoc = await db.updateOne(sessionDbModel, conditions, updates);
        return db.adaptEntity(Session, sessionDoc, idName);
    },
    deleteOne: async (conditions) => {
        const sessionDoc = await db.deleteOne(sessionDbModel, conditions);
        return sessionDoc ? db.adaptEntity(Session, sessionDoc, idName) : null;
    }
});