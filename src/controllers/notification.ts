import { Types } from "mongoose";
import { Notification, NotificationController, NotificationModel } from "../types";
import { NotiFunc } from "../enums";
import { parseNewNotification } from "../utils/parser";
import { Socket } from "socket.io";

const getData = (socket: Socket) => {
    const { data, handshake, emit } = socket;
    const { cookie } = handshake.headers;
    const [_, token] = cookie?.split("=") ?? [undefined, undefined];
    return {
        data,
        emit,
        token
    }
}

export const notificationController = ({
    notificationModel
}: {notificationModel: NotificationModel}): NotificationController => ({
    setNotification: async ({socket, call}) => {
        const {
            data,
            emit,
            token
        } = getData(socket);
        if(!token) return;
        const { fun, followedUserId, treeId, commentId } = parseNewNotification(data);
        if(!fun) return;
        let notification: Notification | undefined;
        switch(fun) {
            case NotiFunc.FOLLOW:
                if(!followedUserId) return emit(call, { error: "followedUserId is required" });
                notification = await notificationModel.newFollower({
                    token,
                    followedUserId: new Types.ObjectId(followedUserId)
                });
                break;
            case NotiFunc.TREE:
                if(!treeId) return emit(call, { error: "treeId is required" });
                notification = await notificationModel.newTree({
                    token,
                    treeId: new Types.ObjectId(treeId)
                });
                break;
            case NotiFunc.COMMENT:
                if(!treeId || !commentId) return emit(call, { error: "treeId and commentId are required" });
                notification = await notificationModel.newComment({
                    token,
                    treeId: new Types.ObjectId(treeId),
                    commentId: new Types.ObjectId(commentId)
                });
                break;
            case NotiFunc.LIKE:
                if(!treeId || !commentId) return emit(call, { error: "treeId and commentId are required" });
                notification = await notificationModel.newLike({
                    token,
                    treeId: new Types.ObjectId(treeId),
                    commentId: new Types.ObjectId(commentId)
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
            const id = new Types.ObjectId(_id);
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