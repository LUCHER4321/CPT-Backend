import { Types } from "mongoose";
import { LikeController, LikeModel } from "../types";

export const likeController = ({
    likeModel
}: { likeModel: LikeModel }): LikeController => ({
    likePhTree: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const like = await likeModel.likePhTree({ token, treeId: new Types.ObjectId(id) });
            if (!like) return res.status(404).json({ message: "PhTree not found" });
            res.json(like);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    unlikePhTree: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await likeModel.unlikePhTree({ token, treeId: new Types.ObjectId(id) });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    likedPhTrees: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const likedPhTrees = await likeModel.likedPhTrees({ token });
            if (!likedPhTrees) return res.status(404).json({ message: "No liked PhTrees found" });
            res.json(likedPhTrees);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    phTreeLikes: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        try {
            const likes = await likeModel.phTreeLikes({ treeId: new Types.ObjectId(id), token });
            if (!likes) return res.status(404).json({ message: "PhTree not found" });
            res.json(likes);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    likeComment: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const like = await likeModel.likeComment({ token, commentId: new Types.ObjectId(id) });
            if (!like) return res.status(404).json({ message: "Comment not found" });
            res.json(like);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    unlikeComment: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await likeModel.unlikeComment({ token, commentId: new Types.ObjectId(id) });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    likedComments: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const likedComments = await likeModel.likedComments({ token });
            if (!likedComments) return res.status(404).json({ message: "No liked comments found" });
            res.json(likedComments);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    commentLikes: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        try {
            const likes = await likeModel.commentLikes({ commentId: new Types.ObjectId(id), token });
            if (!likes) return res.status(404).json({ message: "Comment not found" });
            res.json(likes);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
});