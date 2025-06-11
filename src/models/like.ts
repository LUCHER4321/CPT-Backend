import { CommentClass } from "../schemas/comment";
import { LikeClass } from "../schemas/like";
import { PhTreeClass } from "../schemas/phTree";
import { userByToken } from "../schemas/user";
import { LikeModel } from "../types";
import { nullableInput } from "../utils/nullableInput";
import { commentModel } from "./comment";

export const likeModel: LikeModel = {
    likePhTree: async ({token, treeId}) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const liked = await PhTreeClass.findById(treeId);
        if(!liked) return undefined;
        const prevLike = await LikeClass.findOne({
            userId: user._id,
            treeId: liked._id
        });
        if(prevLike) throw new Error(`${user.username} already likes ${liked.name}`);
        const like = new LikeClass({
            userId: user._id,
            treeId: liked._id
        });
        const newLike = await like.save();
        if(!newLike.userId.prototype || !newLike.treeId?.prototype) throw new Error("IDs not found");
        return {
            id: newLike._id,
            userId: newLike.userId.prototype,
            treeId: newLike.treeId.prototype,
            createdAt: newLike.createdAt
        };
    },
    unlikePhTree: async ({token, treeId}) => {
        const user = await userByToken(token);
        if (!user) return;
        const liked = await PhTreeClass.findById(treeId);
        if(!liked) return;
        const { deletedCount } = await LikeClass.deleteOne({
            userId: user._id,
            treeId: liked._id
        });
        if(deletedCount === 0) throw new Error(`${user.username} doesn't like ${liked.name}`);
    },
    likedPhTrees: async ({token}) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const likes = await LikeClass.find({ userId: user._id });
        const phTrees = (await Promise.all(likes.map(l => nullableInput(l.treeId?.prototype, p => PhTreeClass.findById(p))))).filter(t => t !== null && t !== undefined);
        return phTrees.filter(t => t.userId.prototype !== null && t.userId.prototype !== undefined).map(t => ({
            id: t._id,
            userId: t.userId.prototype!,
            name: t.name,
            image: t.image ?? undefined,
            description: t.description ?? undefined,
            isPublic: t.isPublic,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            tags: t.tags ?? undefined,
            collaborators: t.collaborators?.filter(c => c.prototype).map(c => c.prototype!) ?? undefined
        }));
    },
    phTreeLikes: async ({token, treeId}) => {
        const likes = await LikeClass.find({ treeId });
        const likesCount = likes.length;
        const user = await nullableInput(token, userByToken);
        const myLike = nullableInput(user, u => likes.map(l => l.userId.prototype).includes(u._id));
        return {
            likesCount,
            myLike
        };
    },
    likeComment: async ({token, commentId}) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const liked = await CommentClass.findById(commentId);
        if(!liked) return undefined;
        const prevLike = await LikeClass.findOne({
            userId: user._id,
            treeId: liked._id
        });
        if(prevLike) throw new Error(`${user.username} already likes the comment "${liked.content}"`);
        const like = new LikeClass({
            userId: user._id,
            commentId: liked._id
        });
        const newLike = await like.save();
        if(!newLike.userId.prototype || !newLike.commentId?.prototype) throw new Error("IDs not found");
        return {
            id: newLike._id,
            userId: newLike.userId.prototype,
            commentId: newLike.commentId.prototype,
            createdAt: newLike.createdAt
        };
    },
    unlikeComment: async ({token, commentId}) => {
        const user = await userByToken(token);
        if (!user) return;
        const liked = await CommentClass.findById(commentId);
        if(!liked) return;
        const { deletedCount } = await LikeClass.deleteOne({
            userId: user._id,
            commentId: liked._id
        });
        if(deletedCount === 0) throw new Error(`${user.username} doesn't comment "${liked.content}"`);
    },
    likedComments: async ({token}) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const likes = await LikeClass.find({ userId: user._id });
        const comments = (await Promise.all(likes.map(l => nullableInput(l.commentId?.prototype, p => CommentClass.findById(p))))).filter(c => c !== null && c !== undefined && c.treeId.prototype != undefined).map(c => c!);
        return (await Promise.all(comments.map(c => commentModel.getComment({ treeId: c.treeId.prototype!, id: c._id })))).filter(c => c !== undefined);
    },
    commentLikes: async ({token, commentId}) => {
        const comment = await CommentClass.findById(commentId);
        if(!comment?.content) return undefined;
        const likes = await LikeClass.find({ commentId });
        const likesCount = likes.length;
        const user = await nullableInput(token, userByToken);
        const myLike = nullableInput(user, u => likes.map(l => l.userId.prototype).includes(u._id));
        return {
            likesCount,
            myLike
        };
    },
}