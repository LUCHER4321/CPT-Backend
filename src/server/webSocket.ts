import { Server } from "socket.io";
import { createNotificationIO } from "../routes/notification";
import { notificationController } from "../controllers/notification";
import { notificationModel } from "../models/notification";

export const webSocket = ({io}: {io: Server}) => createNotificationIO({
    io,
    notificationController: notificationController({
        notificationModel
    })
});