import express, { Application } from "express";
import { defaultPort } from "./commons/variables";
import { env } from "./env";
import { adminRouter } from "./routers/index";

const app: Application = express();
const port: string | number = env.PORT || defaultPort;

app.use(express.json());
app.use("/admin", adminRouter);

app.use((req, res) => {
    res.status(404).end(JSON.stringify({ message: "Path_Not_Found" }));
});

app.listen(port, () => {
    console.log(`server started running at port: ${port}`);
});