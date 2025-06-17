import { rename, unlink } from "node:fs";
import { ImageModel } from "../types";
import { IMAGES } from "../config";
import { userByToken } from "../utils/token";
import { join } from "node:path";

const toPathList = (path: string, discard = 0) => path.split("/").flatMap(p => p.split("\\")).filter((_, index, array) => index < array.length - discard)

export const imageModel: ImageModel = {
    getImage: async ({ img }) => {
        if (!img) {
            throw new Error("Image name is required");
        }
        return { path: join(...toPathList(__dirname, 2), ...toPathList(IMAGES), img) };
    },
    createImage: async ({ token, file }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        if (!file) {
            throw new Error("File is required");
        }
        const [_, extension] = file.originalname.split('.')
        if (!extension) {
            throw new Error("File must have an extension");
        }
        if (!["jpg", "jpeg", "png", "gif"].includes(extension)) {
            throw new Error("File must be an image (jpg, jpeg, png, gif)");
        }
        const fileName = `${user._id.toString()}-${Date.now()}.${extension}`;
        const newPath = `${IMAGES}/${fileName}`;
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
        unlink(`${IMAGES}/${img}`, (err) => {
            if(err) throw new Error("Error deleting image");
        });
    }
}