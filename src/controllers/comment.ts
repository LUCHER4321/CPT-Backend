import { CommentController, CommentModel } from "../types";
import { getKey, parseNewComment, parsePatchComment, toObjectId } from "../utils/parser";

export const commentController = ({
    commentModel
}: { commentModel: CommentModel }): CommentController => ({
    createComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId: t_id } = req.params
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const treeId = toObjectId(t_id);
            const { content, parentId: _id } = parseNewComment(req.body);
            const parentId = getKey(_id);
            const newComment = await commentModel.createComment({ token, treeId, content, parentId, key });
            if (!newComment) return res.status(404).json({ message: "PhTree not found" });
            res.json(newComment);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    deleteComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            await commentModel.deleteComment({ token, treeId, id, key });
            res.status(204).json({ message: "Comment deleted successfully" });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    updateComment: async (req, res) => {
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        const { content } = parsePatchComment(req.body);
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!content) return res.status(400).json({ message: "Content is required" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            const updatedComment = await commentModel.updateComment({ token, treeId, id, content, key });
            if (!updatedComment) return res.status(404).json({ message: "Comment not found" });
            res.json(updatedComment);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getComments: async (req, res) => {
        const { treeId: _id } = req.params;
        try {
            const treeId = toObjectId(_id)
            const comments = await commentModel.getComments({ treeId });
            if (!comments) return res.status(404).json({ message: "PhTree not found" });
            res.json(comments);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getComment: async (req, res) => {
        const { treeId: t_id, id: _id } = req.params;
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            const replies = await commentModel.getComment({ treeId, id });
            if (!replies) return res.status(404).json({ message: "Parent comment not found" });
            res.json(replies);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    }
});