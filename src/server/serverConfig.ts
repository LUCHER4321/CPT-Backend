import { Express, json, Router } from "express"
import morgan from "morgan";
import { corsMw } from "../middlewares/cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server, ServerOptions } from "socket.io";

interface ServerConfigProps {
    app?: Express;
    webSocket?: (socket: {io: Server}) => Server;
    baseRouter?: {
        url: string;
        router: Router;
    };
    serverOptions?: ServerOptions
}

export default ({
    app,
    baseRouter = {
        url: "/",
        router: Router()
    },
    webSocket,
    serverOptions
} : ServerConfigProps) => {
    const server = createServer(app);
    const io = new Server(server, serverOptions);
    const socket = webSocket?.({io});
    app?.use(json());
    app?.use(corsMw());
    app?.use(morgan("dev"));
    app?.use(cookieParser());
    app?.use(baseRouter.url, baseRouter.router);
    return { app, server, io, socket };
};