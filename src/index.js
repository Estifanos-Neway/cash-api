const color = require("cli-color");
const { makeApp } = require("./app");
const { default: mongoose } = require("mongoose");
const { env } = require("./env");

const app = makeApp();
const port = app.get("port");

app.listen(port, async () => {
    console.log(color.blue(`\n> Server started running at port: ${color.bold(port)}`));
    // @ts-ignore
    await mongoose.connect(env.DB_URL, { keepAlive: true });
    console.log(color.blue("> Connected to the database\n"));
});