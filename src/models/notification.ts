import { Types } from "mongoose";
import { NotificationClass } from "../schemas/notification";
import { NotificationModel } from "../types";
import { PhTreeClass } from "../schemas/phTree";
import { FollowClass } from "../schemas/follow";
import { CommentClass } from "../schemas/comment";
import { NotiFunc } from "../utils/enums";
import { userByToken } from "../utils/token";

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
        seen: newNotification.seen,
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
    newFollower: async ({ token, followedUserId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        return await notify({
            fun: NotiFunc.FOLLOW,
            usersId: [followedUserId],
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
    getNotifications: async ({ token, from, limit, see }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const notifications = await NotificationClass.find({
            createdAt: { $gte: from },
            usersId: { $in: [user._id] }
        }).limit(limit ?? Number.MAX_SAFE_INTEGER);
        if(see){
            notifications.map(n => n.seen = true);
            await Promise.all(notifications.map(n => n.save()));
        }
        return notifications.map(n => ({
            id: n._id,
            fun: n.fun,
            usersId: n.usersId,
            inputs: n.inputs,
            authorId: n.authorId,
            seen: n.seen,
            createdAt: n.createdAt
        }));
    }
};