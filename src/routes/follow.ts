import { Router } from "express";
import { FollowController } from "../types";
import { allowedMethods } from "../middlewares/options";

export const createFollowRoutes = ({
    followController
}: { followController: FollowController }) => {
    const router = Router();
    router.post("/:id", followController.followUser);
    router.delete("/:id", followController.unfollowUser);
    router.get("/followers/:userId", followController.getFollowers);
    router.get("/following/:userId", followController.getFollowing);
    router.get("/count/:userId", followController.getFollowersCount);
    allowedMethods({ router, methods: ["GET", "POST", "DELETE"] });
    return router;
};