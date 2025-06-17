import { UserModel } from "../types";
import { tokenSign, userByToken } from "../utils/token";
import { comparePassword, encryptPassword } from "../utils/password";
import { imageModel } from "./image";
import { photoToString } from "../utils/photo";
import { UserClass } from "../schemas/user";
import { FollowClass } from "../schemas/follow";
import { LikeClass } from "../schemas/like";
import { Role } from "../utils/enums";
import { APIKeyClass } from "../schemas/apiKey";
import { confirmAPIKey } from "../utils/apiKey";

export const userModel: UserModel = {
    register: async ({ email, password, username, key }) => {
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
        const token = tokenSign({ id: newUser._id, role: newUser.role });
        return {
            ...(await userModel.getUser({ id: newUser._id }))!,
            token
        };
    },
    login: async ({ email, password, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await UserClass.findOne({ email });
        if (!user) throw new Error("User not found");
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) throw new Error("Invalid password");
        user.lastLogin = new Date();
        user.isActive = true;
        const token = tokenSign({ id: user._id, role: user.role });
        await user.save();
        return {
            ...(await userModel.getUser({ id: user._id }))!,
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
    },
    getUser: async ({ id }) => {
        const user = await UserClass.findById(id);
        if (!user) return undefined;
        return {
            id: user._id,
            email: user.email,
            username: user.username,
            photo: photoToString(user.photo),
            role: user.role,
            lastLogin: user.lastLogin,
            isActive: user.isActive
        };
    },
    getMe: async ({ token }) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const apiKeys = user.role !== Role.USER ? (await APIKeyClass.find({ userId: user._id })).map(k => k._id) : undefined;
        return {
            ...(await userModel.getUser({ id: user._id }))!,
            apiKeys
        };
    },
    updateMe: async ({ username, oldPassword, password, token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        const user0 = await UserClass.findOne({ username });
        if (user0 && user0.username !== user.username) throw new Error("Username taken");
        if (password && oldPassword) {
            const isMatch = await comparePassword(oldPassword, user.password);
            if(!isMatch) throw new Error("Invalid password");
            user.password = await encryptPassword(password);
        }
        if (username) user.username = username;
        await user.save();
        return await userModel.getMe({ token });
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
    photoMe: async ({ photo, token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        user.photo = (await imageModel.createImage({ token, file: photo }))?.url;
        await user.save();
        return await userModel.getMe({ token });
    },
    deletePhotoMe: async ({ token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const user = await userByToken(token);
        if (!user) return undefined;
        await imageModel.deleteImage({ token, img: user.photo ?? "" });
        user.photo = undefined;
        await user.save();
        return await userModel.getMe({ token });
    },
    makeAdmin: async ({ token, adminId, removeAdmin, key }) => {
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
        return await userModel.getUser({ id: adminId });
    },
    generateKey: async ({ token, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const user = await userByToken(token);
        if (!user || user.role === Role.USER) return;
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
        const apiKeyToDelete = await APIKeyClass.findById(keyToDelete);
        if(apiKeyToDelete?.userId.prototype !== user._id) return;
        const { _id } = apiKeyToDelete;
        await APIKeyClass.deleteOne({ _id });
    }
};