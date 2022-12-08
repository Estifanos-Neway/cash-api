const mongoose = require("mongoose");
const { affiliatesDb } = require("../database");
const { affiliatesRepo } = require("../repositories");
const { env } = require("../env");

async function populate() {
    // @ts-ignore
    await mongoose.connect(env.DB_URL);
    console.log("Populating...");

    // @ts-ignore
    const affiliates = await affiliatesDb.findMany({ select: ["userId"] });
    for (const affiliate of affiliates) {
        const { userId } = affiliate;
        const children = await affiliatesRepo.getChildren({ userId, getManyQueries: { select: "[\"userId\"]" } });
        const childrenCount = children.length;
        const updatedAffiliate = await affiliatesDb.updateOne({ id: userId }, { childrenCount });
        console.log(`${updatedAffiliate.userId} : ${updatedAffiliate.childrenCount}`);
    }
    console.log("Done!");
    process.exit();
}

populate();