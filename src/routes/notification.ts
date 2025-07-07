import { Server } from "socket.io";
import { NotificationController } from "../types";
import { client, server, setN } from "../config";
import { Router } from "express";

interface IOProps {
    io: Server;
    notificationController: NotificationController;
}

export const createNotificationIO = ({
    io,
    notificationController
}: IOProps) => {
    io.on("connection", socket => {
        socket.on(setN + client, async() => await notificationController.setNotification({ socket, call: setN + server }));
    });
    return io;
};

export const createNotificationRouter = ({
    notificationController
}: Omit<IOProps, "io">) => {
    const router = Router();
    router.get("/", notificationController.getNotifications);
    router.patch("/:id", notificationController.seeNotification)
    return router;
};