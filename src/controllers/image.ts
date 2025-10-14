import { ImageController, ImageModel } from "../types";

export const imageController = ({
    imageModel
}: {
    imageModel: ImageModel
}): ImageController => ({
    getImage: async (req, res) => {
        const { img } = req.params;
        if (!img) return res.status(400).json({ error: "Image name is required" });
        const { path } = await imageModel.getImage({ img }) ?? {};
        if (!path) return res.status(404).json({ error: "Image not found" });
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Failed to fetch image');
            const contentType = response.headers.get('content-type');
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (contentType) res.set('Content-Type', contentType);
            res.send(buffer);
        } catch(e) {
            return res.status(500).json({ error: "Error fetching image" });
        }
    }
});