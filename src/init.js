const { createHash } = require("crypto");
const { adminsDb } = require("./data-access/dbs");
const { signUpAdminRepo } = require("./repositories/admin");
const { defaultAdmin } = require("./config.json");
const { errorLog } = require("./commons/functions");
async function init() {
    // Adding the default admin
    const adminsCount = await adminsDb.count();
    if (adminsCount === 0) {
        const passwordHash = createHash("sha256").update(defaultAdmin.password).digest("hex");
        try {
            await signUpAdminRepo(defaultAdmin.username, passwordHash);
            console.log("Default admin created successfully.");
        } catch (error) {
            errorLog("Failed to create the default admin", error);
        }
    } else {
        console.log("Default admin already exists.");
    }
    console.log("Done!");
}

init();
