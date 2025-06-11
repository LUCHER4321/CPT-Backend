import { Types } from "mongoose";
import { FollowController, FollowModel } from "../types";

export const followController = ({
    followModel
} : {
    followModel: FollowModel
}): FollowController => ({
    followUser: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const follow = await followModel.followUser({ token, followedUserId: new Types.ObjectId(id) });
            if (!follow) return res.status(404).json({ message: "User not found" });
            res.json(follow);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    unfollowUser: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await followModel.unfollowUser({ token, followedUserId: new Types.ObjectId(id) });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowers: async (req, res) => {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: "User ID is required" });
        try {
            const followers = await followModel.getFollowers({ userId: new Types.ObjectId(userId) });
            if (!followers) return res.status(404).json({ message: "No followers found" });
            res.json(followers);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowing: async (req, res) => {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: "User ID is required" });
        try {
            const following = await followModel.getFollowing({ userId: new Types.ObjectId(userId) });
            if (!following) return res.status(404).json({ message: "No following found" });
            res.json(following);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowersCount: async (req, res) => {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: "User ID is required" });
        try {
            const count = await followModel.getFollowersCount({ userId: new Types.ObjectId(userId) });
            if (!count) return res.status(404).json({ message: "User not found" });
            res.json({ count });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
});