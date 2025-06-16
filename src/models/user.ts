import { UserModel } from "../types";
import { tokenSign } from "../utils/token";
import { comparePassword, encryptPassword } from "../utils/password";
import { imageModel } from "./image";
import { photoToString } from "../utils/photo";
import { userByToken, UserClass } from "../schemas/user";
import { FollowClass } from "../schemas/follow";
import { LikeClass } from "../schemas/like";

export const userModel: UserModel = {
    register: async ({ email, password, username }) => {
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
    login: async ({ email, password }) => {
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
    logout: async ({ token }) => {
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
        return await userModel.getUser({ id: user._id });
    },
    updateMe: async ({ username, password, token }) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        const user0 = await UserClass.findOne({ username });
        if (user0 && user0.username !== user.username) throw new Error("Username taken");
        if (password) user.password = await encryptPassword(password);
        if (username) user.username = username;
        await user.save();
        return await userModel.getMe({ token });
    },
    deleteMe: async ({ token }) => {
        const user = await userByToken(token);
        if (!user) return;
        const { deletedCount } = await UserClass.deleteOne({ _id: user.id });
        if (deletedCount === 0) throw new Error("User not found");
        await userModel.deletePhotoMe({ token })
        await FollowClass.deleteMany({ userId: user._id });
        await LikeClass.deleteMany({ userId: user._id });
    },
    photoMe: async ({ photo, token }) => {
        const user = await userByToken(token);
        if (!user) return undefined;
        user.photo = (await imageModel.createImage({ token, file: photo }))?.url;
        await user.save();
        return await userModel.getMe({ token });
    },
    deletePhotoMe: async ({ token }) => {
        const user = await userByToken(token);
        if (!user) return;
        await imageModel.deleteImage({ token, img: user.photo ?? "" });
        user.photo = undefined;
        await user.save();
    }
};