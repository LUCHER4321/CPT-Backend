import { Email, UserModel } from "../types";
import { tokenSign, userByToken } from "../utils/token";
import { comparePassword, encryptPassword } from "../utils/password";
import { imageModel } from "./image";
import { photoToString } from "../utils/photo";
import { UserClass } from "../schemas/user";
import { FollowClass } from "../schemas/follow";
import { LikeClass } from "../schemas/like";
import { Plan, Role } from "../enums";
import { APIKeyClass } from "../schemas/apiKey";
import { confirmAPIKey } from "../utils/apiKey";
import { randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { sendMail } from "../utils/sendMail";
import { upgradeByDomain } from "../utils/upgradeByDomain";

const checkPlan = async (id: Types.ObjectId) => {
    const user = await UserClass.findById(id);
    if(!user || user.plan === Plan.FREE || !user.planExpiration) return;
    const date = new Date();
    if(date.getTime() >= user.planExpiration.getTime()) {
        user.plan = Plan.FREE;
        await user.save();
    }
};

export const userModel: UserModel = {
    register: async ({ email, password, username, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user0 = await UserClass.findOne({ email });
        if (user0) throw new Error("Email already exists");
        const user1 = await UserClass.findOne({ username });
        if (user1) throw new Error("Username taken");
        const user = new UserClass({
            email,
            password: await encryptPassword(password),
            username
        });
        const newUser = await user.save();
        const token = tokenSign({ id: newUser._id });
        await upgradeByDomain(email);
        return {
            ...(await userModel.getUser({ id: newUser._id, host }))!,
            token
        };
    },
    login: async ({ email, password, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await UserClass.findOne({ email });
        if (!user) throw new Error("User not found");
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) throw new Error("Invalid password");
        user.lastLogin = new Date();
        user.isActive = true;
        const token = tokenSign({ id: user._id });
        await user.save();
        await upgradeByDomain(email);
        return {
            ...(await userModel.getUser({ id: user._id, host }))!,
            token
        };
    },
    logout: async ({ token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const user = await userByToken(token);
        if (!user) return;
        user.isActive = false;
        await user.save();
        await checkPlan(user._id);
    },
    getUser: async ({ id, host }) => {
        const user = await UserClass.findById(id);
        if (!user) return undefined;
        await checkPlan(user._id);
        return {
            id: user._id,
            email: user.email as Email,
            username: user.username,
            photo: photoToString(user.photo ?? null, host ?? ""),
            plan: user.plan,
            subId: user.subId ?? undefined,
            billing: user.billing ?? undefined,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive,
            description: user.description ?? undefined
        };
    },
    search: async ({ limit, search, host }) => {
        const regex = new RegExp(search ?? "", "i");
        const users = await UserClass.find({
            $or: [
                { username: regex },
                { email: regex }
            ]
        })
        .limit(limit ?? 0)
        .sort({ username: 1});
        return users.map(user => ({
            id: user._id,
            email: user.email as Email,
            username: user.username,
            photo: photoToString(user.photo ?? null, host ?? ""),
            plan: user.plan,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive,
            description: user.description ?? undefined
        }));
    },
    recover: async ({ email, url, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await UserClass.findOne({ email });
        if(!user) throw new Error("User not found");
        const token = randomBytes(20).toString("hex");
        const expires = new Date((new Date()).getTime() + 2.5 * 3600);
        user.tokens.push({
            token,
            expires
        });
        await user.save();
        await sendMail({ token, url, user: userModel.getUser({ id: user._id }) })
        return token;
    },
    resetPassword: async ({ token, email, password, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const user = await UserClass.findOne({
            "tokens.token": token,
            "tokens.expires": {
                $lt: new Date()
            },
            email
        });
        if(!user) throw new Error("User not found");
        user.password = await encryptPassword(password);
        user.tokens = new Types.DocumentArray([]);
        await user.save();
        return await userModel.getUser({ id: user._id });
    },
    getMe: async ({ token, host }) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const apiKeys = user.role !== Role.USER ? (await APIKeyClass.find({
            $expr: {
                $eq: [
                    { $toString: "$userId" },
                    user._id.toString()
                ]
            }
        })).map(k => k._id) : undefined;
        const billing = user.billing ?? undefined;
        return {
            ...(await userModel.getUser({ id: user._id, host }))!,
            apiKeys,
            billing
        };
    },
    generateToken: async({ oldToken, expiresIn, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(oldToken);
        if (!user) return undefined;
        await checkPlan(user._id);
        const token = tokenSign({ id: user._id, expiresIn });
        return { token }
    },
    updateMe: async ({ username, oldPassword, password, description, plan, subId, billing, token, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        const user0 = await UserClass.findOne({ username });
        if (user0 && user0.username !== user.username) throw new Error("Username taken");
        if (password && oldPassword && password !== oldPassword) {
            const isMatch = await comparePassword(oldPassword, user.password);
            if(!isMatch) throw new Error("Invalid password");
            user.password = await encryptPassword(password);
        }
        if (username && username !== user.username) user.username = username;
        if(description) user.description = description;
        if(plan) user.plan = plan;
        if(subId) user.subId = subId;
        else if (subId === null) user.subId = undefined;
        if(billing) user.billing = billing;
        else if (billing === null) user.billing = undefined;
        await user.save();
        return await userModel.getMe({ token, host });
    },
    deleteMe: async ({ token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return;
        const { deletedCount } = await UserClass.deleteOne({ _id: user.id });
        if (deletedCount === 0) throw new Error("User not found");
        await userModel.deletePhotoMe({ token })
        await FollowClass.deleteMany({ userId: user._id });
        await LikeClass.deleteMany({ userId: user._id });
    },
    photoMe: async ({ photo, token, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        user.photo = (await imageModel.createImage({ token, file: photo }))?.url;
        await user.save();
        return await userModel.getMe({ token, host });
    },
    deletePhotoMe: async ({ token, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        await imageModel.deleteImage({ token, img: user.photo ?? "" });
        user.photo = undefined;
        await user.save();
        return await userModel.getMe({ token, host });
    },
    makeAdmin: async ({ token, adminId, removeAdmin, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (user?.role !== Role.BOSS) return;
        const admin = await UserClass.findById(adminId);
        if(!admin) return;
        admin.role = removeAdmin ? Role.USER : Role.ADMIN;
        const newAPIKey = removeAdmin ? undefined : new APIKeyClass({ userId: admin._id });
        await newAPIKey?.save();
        await admin.save();
        return await userModel.getUser({ id: adminId, host });
    },
    generateKey: async ({ token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const user = await userByToken(token);
        if (!user || user.role === Role.USER) return;
        await checkPlan(user._id);
        const newAPIKey = new APIKeyClass({ userId: user._id });
        await newAPIKey.save();
        await user.save();
        return newAPIKey._id;
    },
    deleteKey: async ({ token, keyToDelete, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const user = await userByToken(token);
        if (!user || user.role === Role.USER) return;
        await checkPlan(user._id);
        const apiKeyToDelete = await APIKeyClass.findById(keyToDelete);
        if(apiKeyToDelete?.userId !== user._id) return;
        const { _id } = apiKeyToDelete;
        await APIKeyClass.deleteOne({ _id });
    }
};