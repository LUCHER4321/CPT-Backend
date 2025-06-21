import { ImageController, ImageModel } from "../types";

export const imageController = ({
    imageModel
}: {
    imageModel: ImageModel
}): ImageController => ({
    getImage: async (req, res) => {
        const { img } = req.params;
        if (!img) return res.status(400).json({ error: "Image name is required" });
        const { path } = await imageModel.getImage({ img }) ?? { path: undefined };
        if (!path) return res.status(404).json({ message: "Image not found" });
        res.sendFile(path);
    }
});