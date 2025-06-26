import { UserController, UserModel } from "../types";
import { getKey, parseLogin, parseNewAdmin, parsePatchUser, parseRegister, toObjectId } from "../utils/parser";

export const userController = ({
    userModel
}: {
    userModel: UserModel
}): UserController => ({
    register: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const data = parseRegister(req.body);
            const {
                token,
                ...user
            } = await userModel.register({ ...data, key }) ?? { id: undefined };
            if (!user.id) return res.status(400).json({ message: "User already exists" });
            res.cookie("token", token, { httpOnly: true, secure: true });
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    login: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const data = parseLogin(req.body);
            const {
                token,
                ...user
            } = await userModel.login({ ...data, key }) ?? { id: undefined };
            if (!user.id) return res.status(401).json({ message: "User not found" });
            res.cookie("token", token, { httpOnly: true, secure: true });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    logout: async (req, res) => {
        const { token } = req.cookies;
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        res.clearCookie("token");
        await userModel.logout({ token, key });
        res.status(200).json({ message: "Logged out successfully" });
    },
    getUser: async (req, res) => {
        const { id: _id } = req.params;
        try {
            const id = toObjectId(_id);
            const user = await userModel.getUser({ id });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    search: async (req, res) => {
        const { search, limit } = req.query;
        try {
            const users = await userModel.search({
                search: search ? String(search) : undefined,
                limit: limit ? Number(limit) : 10
            });
            if (!users || users.length === 0) return res.status(404).json({ message: "No users found" });
            res.status(200).json(users);
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
    generateToken: async (req, res) => {
        const { token: oldToken } = req.cookies;
        if (!oldToken) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { expiresIn } = req.body;
        try {
            const { token } = await userModel.generateToken({ oldToken, expiresIn, key }) ?? {};
            if (!token) return res.status(404).json({ message: "User not found" });
            res.cookie("token", token, { httpOnly: true, secure: true });
            res.status(200).json({ message: "Token generated successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updateMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const data = parsePatchUser(req.body);
            const user = await userModel.updateMe({ ...data, token, key });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            await userModel.deleteMe({ token, key });
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
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const user = await userModel.photoMe({ photo, token, key });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhotoMe: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const user = await userModel.deletePhotoMe({ token, key });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    makeAdmin: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const { adminId: id, removeAdmin } = parseNewAdmin(req.body);
            const adminId = getKey(id)!;
            const admin = await userModel.makeAdmin({ token, key, adminId, removeAdmin });
            if(!admin) return res.status(404).json({ message: "Admin not found" });
            res.status(200).json(admin);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    generateKey: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey: defaultAPIKey } = req.query;
        const key = getKey(defaultAPIKey);
        try {
            const apiKey = await userModel.generateKey({ token, key });
            if(!apiKey) return res.status(404).json({ message: "API Key not found" });
            res.status(200).json({ apiKey });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteKey: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const { keyTD } = req.params;
        const key = getKey(apiKey);
        try {
            const keyToDelete = getKey(keyTD)!;
            await userModel.deleteKey({ token, key, keyToDelete });
            res.status(200).json({ message: "Key deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});