import { Router } from "express";
import { ImageController } from "../types"

export const createImageRoutes = ({
    imageController
}: {imageController: ImageController}) => {
    const router = Router();
    router.get("/:img", imageController.getImage);
    return router;
}