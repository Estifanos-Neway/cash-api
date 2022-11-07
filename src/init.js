const mongoose = require("mongoose");
const { adminsDb } = require("./database");
const { adminsRepo } = require("./repositories");
const { defaultAdmin } = require("./configs");
const {
    errorLog,
    hash } = require("./commons/functions");
const { env } = require("./env");

async function init() {
    // @ts-ignore
    await mongoose.connect(env.DB_URL);
    // Creating the default admin
    console.log("Creating the default admin");
    const adminsCount = await adminsDb.count();
    if (adminsCount === 0) {
        const passwordHash = hash(defaultAdmin.password);
        try {
            await adminsRepo.signUp({ username: defaultAdmin.username, passwordHash });
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