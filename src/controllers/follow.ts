import { FollowController, FollowModel } from "../types";
import { getKey, toObjectId } from "../utils/parser";

export const followController = ({
    followModel
} : {
    followModel: FollowModel
}): FollowController => ({
    followUser: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const followedUserId = toObjectId(id);
            const follow = await followModel.followUser({ token, followedUserId, key });
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
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const followedUserId = toObjectId(id);
            await followModel.unfollowUser({ token, followedUserId, key });
            res.status(204).json({ message: "User unfollowed successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowers: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = getKey(id)!;
            const followers = await followModel.getFollowers({ userId });
            if (!followers) return res.status(404).json({ message: "No followers found" });
            res.json(followers);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowing: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = toObjectId(id);
            const following = await followModel.getFollowing({ userId });
            if (!following) return res.status(404).json({ message: "No following found" });
            res.json(following);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getFollowersCount: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = toObjectId(id);
            const count = await followModel.getFollowersCount({ userId });
            if (!count) return res.status(404).json({ message: "User not found" });
            res.json({ count });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
});