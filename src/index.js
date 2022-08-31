const express = require("express");
const { defaultPort } = require("./commons/variables");
const { adminRouter } = require("./routers");

const app = express();
const port = process.env.PORT || defaultPort;

app.use(express.json());
app.use("/admin", adminRouter);

app.use((req, res) => {
    res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
});

app.listen(port, () => {
    console.log(`server started running at port: ${port}`);
});