import { Types } from "mongoose";
import { NotificationClass } from "../schemas/notification";
import { NotificationModel } from "../types";
import { PhTreeClass } from "../schemas/phTree";
import { FollowClass } from "../schemas/follow";
import { CommentClass } from "../schemas/comment";
import { NotiFunc } from "../enums";
import { userByToken } from "../utils/token";
import { confirmAPIKey } from "../utils/apiKey";

interface NotifyProps {
    fun: NotiFunc;
    usersId?: Types.ObjectId[];
    inputs?: string[];
    authorId: Types.ObjectId;
}

const notify = async ({
    fun,
    usersId = [],
    inputs,
    authorId
}: NotifyProps) => {
    const notification = new NotificationClass({
        fun,
        usersId,
        inputs,
        authorId
    });
    const newNotification = await notification.save();
    if((newNotification.usersId.length > 0 && !newNotification.usersId.reduce((a, b) => a && b)) || !newNotification.authorId) throw new Error("IDs not found");
    return {
        id: newNotification._id,
        fun: newNotification.fun,
        usersId: newNotification.usersId,
        inputs: newNotification.inputs,
        authorId: newNotification.authorId,
        seen: false,
        createdAt: newNotification.createdAt
    }
};

const getParents = async (id: Types.ObjectId): Promise<Types.ObjectId[]> => {
    const comment = await CommentClass.findById(id);
    if(!comment?.userId) return [];
    if(!comment.parentId) return [comment.userId];
    const parents = await getParents(comment.parentId);
    if(parents.includes(comment.userId)) return parents;
    return [comment.userId, ...parents];
};

export const notificationModel: NotificationModel = {
    newFollower: async ({ token, userId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        return await notify({
            fun: NotiFunc.FOLLOW,
            usersId: [userId],
            authorId: user._id
        });
    },
    newTree: async ({ token, treeId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const phTree = await PhTreeClass.findById(treeId);
        if(phTree?.userId !== user._id) throw new Error("Ph. Tree not found");
        const followers = await FollowClass.find({ followedUserId: user._id });
        return await notify({
            fun: NotiFunc.TREE,
            usersId: followers.map(f => f.userId),
            inputs: [phTree.name],
            authorId: user._id
        });
    },
    newComment: async ({ token, treeId, commentId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const phTree = await PhTreeClass.findById(treeId);
        if(!phTree?.userId) throw new Error("Ph. Tree not found");
        const comment = await CommentClass.findById(commentId);
        if(!comment || comment.treeId != phTree._id) throw new Error("Parent comment isn't a tree's comment");
        const commenters = await getParents(commentId);
        const collaborators = [phTree.userId, ...phTree.collaborators ?? []];
        return await notify({
            fun: NotiFunc.COMMENT,
            usersId: [...commenters, ...collaborators],
            inputs: [comment.content ?? ""],
            authorId: user._id
        });
    },
    newLike: async ({ token, treeId, commentId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const phTree = await PhTreeClass.findById(treeId);
        const comment = await CommentClass.findById(commentId);
        const usersId = phTree?.userId ? [phTree.userId, ...phTree.collaborators ?? []] : comment ? await getParents(comment._id) : [];
        return await notify({
            fun: NotiFunc.LIKE,
            usersId,
            authorId: user._id
        });
    },
    newCollaborate: async ({ token, treeId, userId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const phTree = await PhTreeClass.findById(treeId);
        if(!phTree) throw new Error("Ph. Tree not found");
        if(phTree.userId.toString() != user._id.toString() && !phTree.collaborators?.map(c => c.toString()).includes(user._id.toString()))
        return await notify({
            fun: NotiFunc.LIKE,
            usersId: [userId],
            authorId: user._id,
            inputs: [phTree.name]
        });
    },
    getNotifications: async ({ token, from, to, limit }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const notifications0 = NotificationClass.find({
            createdAt: {
                $and: [
                    { $gte: from },
                    { $lte: to }
                ]
            },
            usersId: { $in: [user._id] }
        }).sort({ createdAt: -1 });
        const notifications = await (limit ? notifications0.limit(limit) : notifications0);
        return notifications.map(n => ({
            id: n._id,
            fun: n.fun,
            usersId: n.usersId,
            inputs: n.inputs,
            authorId: n.authorId,
            seen: n.seen.includes(user._id),
            createdAt: n.createdAt
        }));
    },
    seeNotification: async ({ token, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if(!user) throw new Error("User not found");
        const notification = await NotificationClass.findById(id);
        if(!notification) throw new Error("Notification not found");
        if(!notification.usersId.includes(user._id)) throw new Error("You can't see this notification");
        if(!notification.seen.includes(user._id)) notification.seen.push(user._id);
        const updatedNotification = await notification.save();
        return {
            id: updatedNotification._id,
            fun: updatedNotification.fun,
            usersId: updatedNotification.usersId,
            inputs: updatedNotification.inputs,
            authorId: updatedNotification.authorId,
            seen: updatedNotification.seen.includes(user._id),
            createdAt: updatedNotification.createdAt
        }
    }
};