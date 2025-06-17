import { CommentClass } from "../schemas/comment";
import { LikeClass } from "../schemas/like";
import { CommentModel } from "../types";
import { confirmAPIKey } from "../utils/apiKey";
import { nullableInput } from "../utils/nullableInput";
import { userByToken } from "../utils/token";

export const commentModel: CommentModel = {
    createComment: async ({ token, treeId, content, parentId, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        const parent = await nullableInput(parentId, p => CommentClass.findById(p));
        if(parent && parent?.treeId.prototype !== treeId) throw new Error("Parent comment isn't a tree's comment");
        const comment = new CommentClass({
            treeId,
            userId: user?._id,
            content,
            parentId: parent?._id
        });
        const newComment = await comment.save();
        if(!newComment.treeId.prototype) throw new Error("Ph. Tree not found");
        if(!newComment.userId?.prototype) throw new Error("User not found");
        return {
            id: newComment._id,
            treeId: newComment.treeId.prototype,
            userId: newComment.userId.prototype,
            content: newComment.content ?? undefined,
            createdAt: newComment.createdAt,
            updatedAt: newComment.updatedAt
        }
    },
    updateComment: async ({ token, treeId, id, content, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        const comment = await CommentClass.findById(id);
        if(!comment) return undefined;
        if(comment.userId?.prototype !== user._id) throw new Error(`Comment isn't a ${user.username}'s comment`);
        if(comment.treeId.prototype !== treeId) throw new Error("Comment isn't a tree's comment");
        comment.content = content;
        comment.updatedAt = new Date();
        await comment.save();
        return await commentModel.getComment({ treeId, id });
    },
    deleteComment: async ({ token, treeId, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return;
        const comment = await CommentClass.findById(id);
        if(!comment) return;
        if(comment.userId?.prototype !== user._id) throw new Error(`Comment isn't a ${user.username}'s comment`);
        if(comment.treeId.prototype !== treeId) throw new Error("Comment isn't a tree's comment");
        const hasReplies = (await CommentClass.find({ parentId: comment._id })).length > 0;
        if(hasReplies) {
            comment.content = undefined;
            comment.userId = undefined;
            await comment.save();
        } else await CommentClass.deleteOne({ _id: comment._id });
        await LikeClass.deleteMany({ commentId: comment._id });
    },
    getComments: async ({ treeId }) => {
        const parents = await CommentClass.find({
            treeId,
            $or: [
                { parentId: null },
                { parentId: { $exists: false } }
            ]
        });
        return parents.length > 0 ? (await Promise.all(parents.map(p => commentModel.getComment({ treeId, id: p._id })))).filter(p => p !== undefined) : undefined;
    },
    getComment: async ({ treeId, id }) => {
        const comment = await CommentClass.findById(id);
        if(!comment) return undefined;
        if(!comment.userId?.prototype) throw new Error("User ID not found");
        if(comment.treeId.prototype !== treeId) throw new Error("Comment isn't a tree's comment");
        const repliesFind = await CommentClass.find({ parentId: comment._id });
        const replies = repliesFind.length > 0 ? (await Promise.all(repliesFind.map(r => commentModel.getComment({ treeId, id: r._id })))).filter(r => r !== undefined) : undefined;
        return {
            id: comment.id,
            treeId: comment.treeId.prototype,
            userId: comment.userId.prototype,
            content: comment.content ?? undefined,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            replies
        };
    }
}