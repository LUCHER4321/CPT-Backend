import { Router } from "express";
import { CommentController } from "../types";
import { allowedMethods } from "../middlewares/options";

export const createCommentRoutes = ({
    commentController
}: { commentController: CommentController }) => {
    const router = Router();
    router.post("/:treeId", commentController.createComment);
    router.patch("/:treeId/:id", commentController.updateComment);
    router.delete("/:treeId/:id", commentController.deleteComment);
    router.get("/:treeId", commentController.getComments);
    router.get("/:treeId/:id", commentController.getComment);
    allowedMethods({ router });
    return router;
}