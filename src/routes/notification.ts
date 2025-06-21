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
    const { on } = io
    on(setN + client, async(socket) => await notificationController.setNotification({ socket, call: setN + server }));
    on(getN + client, async(socket) => await notificationController.getNotifications({socket, call: getN + server }));
    return io;
};