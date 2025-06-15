import { Server } from "socket.io";
import { NotificationController } from "../types";
import { client, getN, server, setN } from "../config";

interface IOProps {
    io: Server;
    notificationController: NotificationController;
}

export const createNotificationIO = ({
    io,
    notificationController
}: IOProps) => {
    io.on(setN + server, async(socket) => await notificationController.setNotification({ socket, call: setN + client }));
    io.on(getN + server, async(socket) => await notificationController.getNotifications({socket, call: getN + client}));
    return io;
};