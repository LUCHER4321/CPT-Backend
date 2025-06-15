import { Types } from "mongoose";
import { NotificationClass } from "../schemas/notification";
import { userByToken } from "../schemas/user";
import { NotificationModel } from "../types";
import { PhTreeClass } from "../schemas/phTree";
import { FollowClass } from "../schemas/follow";
import { CommentClass } from "../schemas/comment";
import { NotiFunc } from "../utils/enums";

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
    if((newNotification.usersId.length > 0 && !newNotification.usersId.map(i => i.prototype instanceof Types.ObjectId).reduce((a, b) => a && b)) || !newNotification.authorId.prototype) throw new Error("IDs not found");
    return {
        id: newNotification._id,
        fun: newNotification.fun,
        usersId: newNotification.usersId.map(i => i.prototype!),
        inputs: newNotification.inputs,
        authorId: newNotification.authorId.prototype,
        seen: newNotification.seen,
        createdAt: newNotification.createdAt
    }
};

const getParents = async (id: Types.ObjectId): Promise<Types.ObjectId[]> => {
    const comment = await CommentClass.findById(id);
    if(!comment?.userId?.prototype) return [];
    if(!comment.parentId?.prototype) return [comment.userId.prototype];
    const parents = await getParents(comment.parentId.prototype);
    if(parents.includes(comment.userId.prototype)) return parents;
    return [comment.userId.prototype, ...parents];
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
        if(phTree?.userId.prototype !== user._id) throw new Error("Ph. Tree not found");
        const followers = await FollowClass.find({ followedUserId: user._id });
        return await notify({
            fun: NotiFunc.TREE,
            usersId: followers.filter(f => f.userId.prototype instanceof Types.ObjectId).map(f => f.userId.prototype!),
            inputs: [phTree.name],
            authorId: user._id
        });
    },
    newComment: async ({ token, treeId, commentId }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        const phTree = await PhTreeClass.findById(treeId);
        if(!phTree?.userId.prototype) throw new Error("Ph. Tree not found");
        const comment = await CommentClass.findById(commentId);
        if(!comment || comment.treeId.prototype != phTree._id) throw new Error("Parent comment isn't a tree's comment");
        const commenters = await getParents(commentId);
        const collaborators = [phTree.userId, ...phTree.collaborators ?? []].filter(i => i.prototype instanceof Types.ObjectId).map(i => i.prototype!);
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
        const usersId = phTree?.userId.prototype ? [phTree.userId, ...phTree.collaborators ?? []].filter(i => i.prototype instanceof Types.ObjectId).map(i => i.prototype!) : comment ? await getParents(comment._id) : []
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
        return notifications.filter(n => n.authorId.prototype instanceof Types.ObjectId).map(n => ({
            id: n._id,
            fun: n.fun,
            usersId: n.usersId.filter(i => i.prototype instanceof Types.ObjectId).map(i => i.prototype!),
            inputs: n.inputs,
            authorId: n.authorId.prototype!,
            seen: n.seen,
            createdAt: n.createdAt
        }));
    }
};