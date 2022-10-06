const { adminsDb } = require("./data-access");
const { signUpAdminRepo } = require("./repositories/admin");
const { defaultAdmin } = require("./config.json");
const {
    errorLog,
    hash } = require("./commons/functions");

async function init() {
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
