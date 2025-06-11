import { Types } from "mongoose";
import { CommentController, CommentModel } from "../types";
import { parseNewComment, parsePatchComment } from "../utils/parser";

export const commentController = ({
    commentModel
}: { commentModel: CommentModel }): CommentController => ({
    createComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId } = req.params
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const { content, parentId } = parseNewComment(req.body);
            const newComment = await commentModel.createComment({
                token,
                treeId: new Types.ObjectId(treeId),
                content,
                parentId: new Types.ObjectId(parentId)
            });
            if (!newComment) return res.status(404).json({ message: "PhTree not found" });
            res.json(newComment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId, id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id) return res.status(400).json({ message: "Comment ID is required" });
        try {
            await commentModel.deleteComment({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id)
            });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updateComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId, id } = req.params;
        const { content } = parsePatchComment(req.body);
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id || !content) return res.status(400).json({ message: "Comment ID and content are required" });
        try {
            const updatedComment = await commentModel.updateComment({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id),
                content
            });
            if (!updatedComment) return res.status(404).json({ message: "Comment not found" });
            res.json(updatedComment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getComments: async (req, res) => {
        const { treeId } = req.params;
        if (!treeId) return res.status(400).json({ message: "PhTree ID is required" });
        try {
            const comments = await commentModel.getComments({
                treeId: new Types.ObjectId(treeId)
            });
            if (!comments) return res.status(404).json({ message: "PhTree not found" });
            res.json(comments);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getComment: async (req, res) => {
        const { treeId, id } = req.params;
        if (!id) return res.status(400).json({ message: "Parent comment ID is required" });
        try {
            const replies = await commentModel.getComment({
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id)
            });
            if (!replies) return res.status(404).json({ message: "Parent comment not found" });
            res.json(replies);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});