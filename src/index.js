const color = require("cli-color");
const { adminRouter, tokensRouter } = require("./routers");
const { defaultPort } = require("./commons/variables");
const { makeApp } = require("./app");

const app = makeApp(defaultPort, adminRouter, tokensRouter);
const port = app.get("port");

app.listen(port, () => {
    console.log(color.blue(`\nserver started running at port: ${color.bold(port)}`));
});