import { Types } from "mongoose";
import { Notification, NotificationController, NotificationModel } from "../types";
import { NotiFunc } from "../utils/enums";
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
                if(!followedUserId) return;
                notification = await notificationModel.newFollower({
                    token,
                    followedUserId: new Types.ObjectId(followedUserId)
                });
                break;
            case NotiFunc.TREE:
                if(!treeId) return;
                notification = await notificationModel.newTree({
                    token,
                    treeId: new Types.ObjectId(treeId)
                });
                break;
            case NotiFunc.COMMENT:
                if(!treeId || !commentId) return;
                notification = await notificationModel.newComment({
                    token,
                    treeId: new Types.ObjectId(treeId),
                    commentId: new Types.ObjectId(commentId)
                });
                break;
            case NotiFunc.LIKE:
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
    getNotifications: async ({socket, call}) => {
        const {
            data,
            emit,
            token
        } = getData(socket);
        if(!token) return;
        const { from, limit, see } = parseNewNotification(data);
        const notifications = await notificationModel.getNotifications({
            token,
            from,
            limit,
            see
        });
        if(!notifications || notifications.length === 0) return;
        emit(call, notifications);
    }
});