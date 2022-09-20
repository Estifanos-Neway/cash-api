const color = require("cli-color");
const app = require("./app");

const port = app.get("port");

app.listen(port, () => {
    console.log(color.blue(`\nserver started running at port: ${color.bold(port)}`));
});