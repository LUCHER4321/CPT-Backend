import { Notification, NotificationController, NotificationModel } from "../types";
import { NotiFunc } from "../enums";
import { parseNewNotification, toObjectId } from "../utils/parser";
import { getSocketData } from "../utils/getSocketData";

export const notificationController = ({
    notificationModel
}: {notificationModel: NotificationModel}): NotificationController => ({
    setNotification: async ({socket, call}) => {
        const {
            data,
            emit,
            token
        } = getSocketData(socket);
        if(!token) return;
        const { fun, userId, treeId, commentId } = parseNewNotification(data);
        if(!fun) return;
        let notification: Notification | undefined;
        switch(fun) {
            case NotiFunc.FOLLOW:
                if(!userId) return emit(call, { error: "userId is required" });
                notification = await notificationModel.newFollower({
                    token,
                    userId: toObjectId(userId)
                });
                break;
            case NotiFunc.TREE:
                if(!treeId) return emit(call, { error: "treeId is required" });
                notification = await notificationModel.newTree({
                    token,
                    treeId: toObjectId(treeId)
                });
                break;
            case NotiFunc.COMMENT:
                if(!treeId || !commentId) return emit(call, { error: "treeId and commentId are required" });
                notification = await notificationModel.newComment({
                    token,
                    treeId: toObjectId(treeId),
                    commentId: toObjectId(commentId)
                });
                break;
            case NotiFunc.LIKE:
                if(!treeId || !commentId) return emit(call, { error: "treeId and commentId are required" });
                notification = await notificationModel.newLike({
                    token,
                    treeId: toObjectId(treeId),
                    commentId: toObjectId(commentId)
                });
                break;
            case NotiFunc.COLLABORATE:
                if(!treeId || !userId) return emit(call, { error: "treeId and userId are required" });
                notification = await notificationModel.newCollaborate({
                    token,
                    treeId: toObjectId(treeId),
                    userId: toObjectId(userId),
                });
                break;
        }
        if(!notification) return;
        emit(call, notification);
    },
    getNotifications: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        const { from: _from, to: _to, limit: _limit } = req.query;
        try {
            const limit = _limit ? +_limit : undefined;
            const from = _from ? new Date(_from as string) : undefined;
            const to = _to ? new Date(_to as string) : undefined;
            const notifications = await notificationModel.getNotifications({
                token,
                from,
                to,
                limit
            });
            if(!notifications || notifications.length === 0) return res.status(404).json({ message: "No notifications found" });
            res.json(notifications);
        } catch (e: any) {
            res.status(400).json({ message: e.message });
        }
    },
    seeNotification: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        const { id: _id } = req.params;
        try {
            const id = toObjectId(_id);
            const notification = await notificationModel.seeNotification({
                token,
                id
            });
            if(!notification) return res.status(404).json({ message: "Notification not found" });
            res.json(notification);
        } catch (e: any) {
            res.status(400).json({ message: e.message });
        }
    }
});