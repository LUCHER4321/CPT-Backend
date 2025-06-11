import { PORT } from "./config";
import { connectMongo } from "./mongo";
import { baseRouter } from "./server/baseRouter";
import serverConfig from "./server/serverConfig";
import express from "express";

connectMongo();
const app = serverConfig({
    app: express(),
    baseRouter
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});