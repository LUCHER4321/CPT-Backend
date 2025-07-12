import { Server } from "socket.io";
import { createNotificationIO } from "../routes/notification";
import { notificationController } from "../controllers/notification";
import { notificationModel } from "../models/notification";
import { createPhTreeIO } from "../routes/phTree";
import { phTreeController } from "../controllers/phTree";
import { phTreeModel } from "../models/phTree";

export const webSocket = ({io}: {io: Server}) => io.on("connection", socket => {
    createNotificationIO({
        socket,
        notificationController: notificationController({
            notificationModel
        })
    });
    createPhTreeIO({
        socket,
        phTreeController: phTreeController({
            phTreeModel
        })
    });
});