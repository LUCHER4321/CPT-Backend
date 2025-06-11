import { Router } from "express";
import { LikeController } from "../types";
import { allowedMethods } from "../middlewares/options";

export const createLikeRoutes = ({
    likeController
}: { likeController: LikeController }) => {
    const router = Router();
    router.use("/ph-tree", phTreeLikes({ likeController }));
    router.use("/comment", commentLikes({ likeController }));
    allowedMethods({ router, methods: ["GET", "POST", "DELETE"] });
    return router;
};

const phTreeLikes = ({
    likeController
}: { likeController: LikeController }) => {
    const router = Router();
    router.post("/:treeId", likeController.likePhTree);
    router.delete("/:treeId", likeController.unlikePhTree);
    router.get("/liked", likeController.likedPhTrees);
    router.get("/:treeId", likeController.phTreeLikes);
    return router;
};

const commentLikes = ({
    likeController
}: { likeController: LikeController }) => {
    const router = Router();
    router.post("/:commentId", likeController.likeComment);
    router.delete("/:commentId", likeController.unlikeComment);
    router.get("/liked", likeController.likedComments);
    router.get("/:commentId", likeController.commentLikes);
    return router;
}