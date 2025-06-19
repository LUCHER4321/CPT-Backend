import { FollowModel } from "../types";
import { UserClass } from "../schemas/user";
import { FollowClass } from "../schemas/follow";
import { userByToken } from "../utils/token";
import { confirmAPIKey } from "../utils/apiKey";
import { userModel } from "./user";

export const followModel: FollowModel = {
    followUser: async ({ token, followedUserId, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        const followed = await UserClass.findById(followedUserId);
        if(!followed) return undefined;
        const prevFollow = await FollowClass.findOne({
            userId: user._id,
            followedUserId
        });
        if(prevFollow) throw new Error(`${user.username} already follows ${followed.username}`);
        const follow = new FollowClass({
            userId: user._id,
            followedUserId
        });
        const newFollow = await follow.save();
        if(!newFollow.userId || !newFollow.followedUserId) throw new Error("IDs not found");
        return {
            id: newFollow._id,
            userId: newFollow.userId,
            followedUserId: newFollow.followedUserId
        };
    },
    unfollowUser: async ({ token, followedUserId, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return;
        const followed = await UserClass.findById(followedUserId);
        if(!followed) return;
        const { deletedCount } = await FollowClass.deleteOne({
            userId: user._id,
            followedUserId
        })
        if(deletedCount === 0) throw new Error(`${user.username} doesn't follow ${followed.username}`);
    },
    getFollowers: async ({ userId }) => {
        const user = await UserClass.findById(userId);
        if (!user) return undefined;
        const followers = await FollowClass.find({ followedUserId: userId });
        return (await Promise.all(followers.map(f => userModel.getUser({ id: f.userId })))).filter(u => u !== undefined);
    },
    getFollowing: async ({ userId }) => {
        const user = await UserClass.findById(userId);
        if (!user) return undefined;
        const following = await FollowClass.find({ userId });
        return (await Promise.all(following.map(f => userModel.getUser({ id: f.followedUserId })))).filter(u => u !== undefined);
    },
    getFollowersCount: async ({ userId }) => {
        const user = await UserClass.findById(userId);
        if (!user) return undefined;
        const length = await FollowClass.countDocuments({ followedUserId: userId });
        return length;
    }
};