const mongoose = require("mongoose");
const utils = require("../commons/functions");
const { productsDb } = require("../database");
const { env } = require("../env");

async function populate() {
    // @ts-ignore
    await mongoose.connect(env.DB_URL);
    console.log("Starting...");
    // @ts-ignore
    const products = await productsDb.findMany({ select: ["description"] });
    for (const product of products) {
        let { description } = product;
        description = utils.replaceAll(description,"\n","\\n");
        if (description == null || description == "null") {
            description = "[{\"insert\":\"\\n\"}]";
        } else {
            try {
                JSON.parse(description);
            } catch (e) {
                description = `[{"insert":"${description}\\n"}]`;
            }
        }
        const updatedProduct = await productsDb.updateOne({ id: product.productId }, { description });
        console.log(`${updatedProduct.productName} : ${updatedProduct.description}`);
    }
    console.log("Done!");
    process.exit();
}

populate();