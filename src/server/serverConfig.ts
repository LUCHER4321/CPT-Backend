import { Express, json, Router } from "express"
import morgan from "morgan";
import { corsMw } from "../middlewares/cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server, ServerOptions } from "socket.io";
import { notFound } from "../middlewares/notFound";

interface ServerConfigProps {
    app: Express;
    webSocket: (socket: { io: Server }) => Server;
    baseRouter: {
        url: string;
        router: Router;
    };
    serverOptions?: Partial<ServerOptions>
}

export default ({
    app,
    baseRouter: {
        url,
        router
    },
    webSocket,
    serverOptions
}: ServerConfigProps) => {
    const server = createServer(app);
    const io = new Server(server, serverOptions);
    const socket = webSocket?.({ io });
    app.disable("x-powered-by");
    app.use(json());
    app.use(corsMw());
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.get(url, (_, res) => { res.json({ message: "Welcome to Life Tree API" }) });
    app.use(url, router);
    app.use(notFound);
    return { app, server, io, socket };
};