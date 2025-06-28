import { Router } from "express";
import { PhTreeController } from "../types";
import { multerMw } from "../middlewares/multer";
import { allowedMethods } from "../middlewares/options";

export const createPhTreeRoutes = ({
    phTreeController
}: { phTreeController: PhTreeController }) => {
    const router = Router();
    router.post("/", phTreeController.createPhTree);
    router.get("/me", phTreeController.getMyPhTrees);
    router.patch("/:id", phTreeController.updatePhTree);
    router.delete("/:id", phTreeController.deletePhTree);
    router.post("/:id/image", multerMw, phTreeController.setPhTreeImage);
    router.delete("/:id/image", phTreeController.deletePhTreeImage);
    router.get("/", phTreeController.getPhTrees);
    router.get("/:id", phTreeController.getPhTree);
    router.post("/:id/view", phTreeController.setView);
    allowedMethods({ router });
    return router;
};