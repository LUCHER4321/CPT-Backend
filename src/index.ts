import { PORT } from "./config";
import { connectMongo } from "./mongo";
import { baseRouter } from "./server/baseRouter";
import serverConfig from "./server/serverConfig";
import express from "express";
import { webSocket } from "./server/webSocket";

const { server } = serverConfig({
    app: express(),
    baseRouter,
    webSocket
});

connectMongo().then(() => server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}));
