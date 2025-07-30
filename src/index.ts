import { PORT, SOCKET_PORT } from "./config";
import { connectMongo } from "./connections/mongo";
import { baseRouter } from "./server/baseRouter";
import serverConfig from "./server/serverConfig";
import express from "express";
import { webSocket } from "./server/webSocket";
import { corsWS } from "./middlewares/cors";

const { server, io } = serverConfig({
    app: express(),
    baseRouter,
    webSocket,
    serverOptions: {
        cors: corsWS()
    }
});

connectMongo().then(() => server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    io.listen(SOCKET_PORT);
    console.log(`Web Socket is running on http://localhost:${SOCKET_PORT}`)
}));
