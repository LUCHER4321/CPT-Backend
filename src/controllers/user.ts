import { Types } from "mongoose";
import { UserController, UserModel } from "../types";
import { parseLogin, parsePatchUser, parseRegister } from "../utils/parser";

export const userController = ({
    userModel
}: {
    userModel: UserModel
}): UserController => ({
    register: async (req, res) => {
        try {
            const { email, password, username } = parseRegister(req.body);
            const user = await userModel.register({ email, password, username });
            if (!user) return res.status(400).json({ message: "User already exists" });
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = parseLogin(req.body);
            const user = await userModel.login({ email, password });
            if (!user) return res.status(401).json({ message: "Invalid credentials" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    logout: async (req, res) => {
        const { token } = req.cookies;
        res.clearCookie("token");
        await userModel.logout({ token });
        res.status(200).json({ message: "Logged out successfully" });
    },
    getUser: async (req, res) => {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "User ID is required" });
        try {
            const user = await userModel.getUser({ id: new Types.ObjectId(id) });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const user = await userModel.getMe({ token });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updateMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const { username, password } = parsePatchUser(req.body);
            const user = await userModel.updateMe({ username, password, token });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await userModel.deleteMe({ token });
            res.clearCookie("token");
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    photoMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { file: photo } = req;
        if (!photo) return res.status(400).json({ message: "Photo is required" });
        try {
            const user = await userModel.photoMe({ photo, token });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhotoMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const user = await userModel.deletePhotoMe({ token });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});