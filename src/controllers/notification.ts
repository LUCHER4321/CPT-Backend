import { Notification, NotificationController, NotificationModel } from "../types";
import { NotiFunc } from "../enums";
import { getKey, parseNewNotification, toObjectId } from "../utils/parser";
import { getSocketData } from "../utils/getSocketData";
import { nullableInput } from "../utils/nullableInput";

export const notificationController = ({
    notificationModel
}: {notificationModel: NotificationModel}): NotificationController => ({
    setNotification: async ({socket, call, key}) => {
        const {
            token
        } = getSocketData(socket);
        if(!token || !socket.connected) return;
        const { fun, userId, treeId, commentId } = parseNewNotification(key);
        if(!fun) return;
        let notification: Notification | undefined;
        switch(fun) {
            case NotiFunc.FOLLOW:
                if(!userId) return socket.emit("error", { error: "userId is required" });
                notification = await notificationModel.newFollower({
                    token,
                    userId: toObjectId(userId)
                });
                break;
            case NotiFunc.TREE:
                if(!treeId) return socket.emit("error", { error: "treeId is required" });
                notification = await notificationModel.newTree({
                    token,
                    treeId: toObjectId(treeId)
                });
                break;
            case NotiFunc.COMMENT:
                if(!treeId || !commentId) return socket.emit("error", { error: "treeId and commentId are required" });
                notification = await notificationModel.newComment({
                    token,
                    treeId: toObjectId(treeId),
                    commentId: toObjectId(commentId)
                });
                break;
            case NotiFunc.LIKE:
                if(!treeId && !commentId) return socket.emit("error", { error: "treeId or commentId are required" });
                notification = await notificationModel.newLike({
                    token,
                    treeId: nullableInput(treeId, toObjectId),
                    commentId: nullableInput(commentId, toObjectId)
                });
                break;
            case NotiFunc.COLLABORATE:
                if(!treeId || !userId) return socket.emit("error", { error: "treeId and userId are required" });
                notification = await notificationModel.newCollaborate({
                    token,
                    treeId: toObjectId(treeId),
                    userId: toObjectId(userId),
                });
                break;
        }
        if(notification) socket.emit(call, notification);
    },
    getNotifications: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ error: "Unauthorized" });
        const { from: _from, to: _to, limit: _limit } = req.query;
        try {
            const limit = nullableInput(_limit, l => +l);
            const from = nullableInput(_from, f => new Date(f as string));
            const to = nullableInput(_to, t => new Date(t as string));
            const notifications = await notificationModel.getNotifications({
                token,
                from,
                to,
                limit
            });
            if(!notifications) return res.status(404).json({ error: "No notifications found" });
            res.json(notifications);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    seeNotification: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ error: "Unauthorized" });
        const { id: _id } = req.params;
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            const notification = await notificationModel.seeNotification({
                token,
                id,
                key
            });
            if(!notification) return res.status(404).json({ error: "Notification not found" });
            res.json(notification);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    }
});