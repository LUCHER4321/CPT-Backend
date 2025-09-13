import { Socket } from "socket.io";
import { NotificationController } from "../types";
import { client, server, setN } from "../config";
import { Router } from "express";

interface IOProps {
    socket: Socket;
    notificationController: NotificationController;
}

export const createNotificationIO = ({
    socket,
    notificationController
}: IOProps) => socket.on(setN + client, async(key) => await notificationController.setNotification({ socket, call: setN + server, key }));

export const createNotificationRouter = ({
    notificationController
}: Omit<IOProps, "socket">) => {
    const router = Router();
    router.get("/", notificationController.getNotifications);
    router.patch("/:id", notificationController.seeNotification);
    return router;
};