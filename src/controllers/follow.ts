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
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const followedUserId = toObjectId(id);
            const follow = await followModel.followUser({ token, followedUserId, key });
            if (!follow) return res.status(404).json({ error: "User not found" });
            res.json(follow);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    unfollowUser: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const followedUserId = toObjectId(id);
            await followModel.unfollowUser({ token, followedUserId, key });
            res.status(204).json({ message: "User unfollowed successfully" });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getFollowers: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = getKey(id)!;
            const followers = await followModel.getFollowers({ userId });
            if (!followers) return res.status(404).json({ error: "No followers found" });
            res.json(followers);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getFollowing: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = toObjectId(id);
            const following = await followModel.getFollowing({ userId });
            if (!following) return res.status(404).json({ error: "No following found" });
            res.json(following);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getFollowersCount: async (req, res) => {
        const { userId: id } = req.params;
        try {
            const userId = toObjectId(id);
            const count = await followModel.getFollowersCount({ userId });
            if (count === undefined) return res.status(404).json({ error: "User not found" });
            res.json({ count });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
});