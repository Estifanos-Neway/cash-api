const mongoose = require("mongoose");
const { adminsDb } = require("./database");
const { signUpAdminRepo } = require("./repositories/admin-repositories");
const { defaultAdmin } = require("./config.json");
const {
    errorLog,
    hash } = require("./commons/functions");
const { env } = require("./env");

async function init() {
    // @ts-ignore
    await mongoose.connect(env.DB_URL);
    // Adding the default admin
    const adminsCount = await adminsDb.count();
    if (adminsCount === 0) {
        const passwordHash = hash(defaultAdmin.password);
        try {
            await signUpAdminRepo({ username: defaultAdmin.username, passwordHash });
            console.log("Default admin created successfully.");
        } catch (error) {
            errorLog("Failed to create the default admin", error);
        }
    } else {
        console.log("Default admin already exists.");
    }
    console.log("Done!");
    process.exit();
}

init();