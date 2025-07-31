import { rename, unlink } from "node:fs";
import { ImageModel } from "../types";
import { IMAGES } from "../config";
import { userByToken } from "../utils/token";
import { join } from "node:path";
import v2 from "../connections/cloudinary";

const { uploader, url } = v2;
const { upload, destroy } = uploader;
const extensions = ["jpg", "jpeg", "png", "gif", "svg"];

const imgPath = (name: string, includeImage = true) => join(__dirname, "..", "..", includeImage ? IMAGES : "", name);

export const imageModel: ImageModel = {
    getImage: async ({ img }) => {
        if (!img) {
            throw new Error("Image name is required");
        }
        return { path: url(img) };
    },
    createImage: async ({ token, file }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        if (!file) {
            throw new Error("File is required");
        }
        const [extension] = file.originalname.split('.').reverse();
        if (!extension) {
            throw new Error("File must have an extension");
        }
        if (!extensions.includes(extension)) {
            throw new Error(`File must be an image (${extensions.join(", ")})`);
        }
        const { path } = file;
        const name = `${user._id.toString()}-${new Date().getTime()}`;
        const fileName = `${name}.${extension}`;
        const filePath = imgPath(fileName);
        rename(path, filePath, (err) => {
            if (err) throw new Error(`Error renaming ${path} to ${filePath}`);
        });
        await upload(filePath, {
            public_id: name
        });
        unlink(filePath, (error) => {
            if (error) throw new Error(`Error deleting file ${filePath}`);
        })
        return { url: `${IMAGES}/${fileName}` }
    },
    deleteImage: async ({ token, img }) => {
        const user = await userByToken(token);
        if (!user) throw new Error("User not found");
        if (!img) {
            return;
        }
        await destroy(img);
    }
}