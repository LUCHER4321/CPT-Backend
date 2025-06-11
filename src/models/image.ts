import { rename, unlink } from "node:fs";
import { ImageModel } from "../types";
import { userByToken } from "../schemas/user";

export const imageModel: ImageModel = {
    getImage: async ({ img }) => {
        if (!img) {
            throw new Error("Image name is required");
        }
        return { path: `images/${img}` };
    },
    createImage: async ({ token, file }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        if (!file) {
            throw new Error("File is required");
        }
        const originalName = file.originalname.split('.')
        const extension = originalName.pop();
        if (!extension) {
            throw new Error("File must have an extension");
        }
        if (!["jpg", "jpeg", "png", "gif"].includes(extension)) {
            throw new Error("File must be an image (jpg, jpeg, png, gif)");
        }
        const fileName = `${user._id.toString}-${Date.now()}.${extension}`;
        const newPath = `images/${fileName}`;
        rename(file.path, newPath, (err) => {
            if (err) throw new Error("Error creating image");
        });
        return { url: newPath }
    },
    deleteImage: async ({ token, img }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        if (!img) {
            throw new Error("Image path is required");
        }
        unlink(`images/${img}`, (err) => {
            if(err) throw new Error("Error deleting image");
        });
    }
}