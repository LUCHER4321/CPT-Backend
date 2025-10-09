import { LikeController, LikeModel } from "../types";
import { getKey, toObjectId } from "../utils/parser";

export const likeController = ({
    likeModel
}: { likeModel: LikeModel }): LikeController => ({
    likePhTree: async (req, res) => {
        const { treeId: id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const treeId = toObjectId(id);
            const like = await likeModel.likePhTree({ token, treeId, key });
            if (!like) return res.status(404).json({ message: "PhTree not found" });
            res.json(like);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    unlikePhTree: async (req, res) => {
        const { treeId: id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const treeId = toObjectId(id);
            await likeModel.unlikePhTree({ token, treeId, key });
            res.status(204).json({ message: "Like deleted successfully" });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    likedPhTrees: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { host } = req.headers;
        try {
            const likedPhTrees = await likeModel.likedPhTrees({ token, host });
            if (!likedPhTrees) return res.status(404).json({ message: "No liked PhTrees found" });
            res.json(likedPhTrees);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    phTreeLikes: async (req, res) => {
        const { treeId: id } = req.params;
        const { token } = req.cookies;
        try {
            const treeId = toObjectId(id);
            const likes = await likeModel.phTreeLikes({ treeId, token });
            if (!likes) return res.status(404).json({ message: "PhTree not found" });
            res.json(likes);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    likeComment: async (req, res) => {
        const { commentId: id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const commentId = toObjectId(id);
            const like = await likeModel.likeComment({ token, commentId, key });
            if (!like) return res.status(404).json({ message: "Comment not found" });
            res.json(like);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    unlikeComment: async (req, res) => {
        const { commentId: id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const commentId = toObjectId(id);
            await likeModel.unlikeComment({ token, commentId, key });
            res.status(204).json({ message: "Like deleted successfully" });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    likedComments: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const likedComments = await likeModel.likedComments({ token });
            if (!likedComments) return res.status(404).json({ message: "No liked comments found" });
            res.json(likedComments);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    commentLikes: async (req, res) => {
        const { commentId: id } = req.params;
        const { token } = req.cookies;
        try {
            const commentId = toObjectId(id);
            const likes = await likeModel.commentLikes({ commentId, token });
            if (!likes) return res.status(404).json({ message: "Comment not found" });
            res.json(likes);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
});