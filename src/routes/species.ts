import { Router } from "express";
import { SpeciesController } from "../types";
import { multerMw } from "../middlewares/multer";
import { allowedMethods } from "../middlewares/options";

export const createSpeciesRoutes = ({
    speciesController
}: { speciesController: SpeciesController }) => {
    const router = Router();
    router.post("/:treeId", speciesController.createSpecies);
    router.patch("/:treeId/:id", speciesController.updateSpecies);
    router.delete("/:treeId/:id", speciesController.deleteSpecies);
    router.post("/:treeId/:id/image", multerMw, speciesController.setSpeciesImage);
    router.delete("/:treeId/:id/image", speciesController.deleteSpeciesImage);
    router.get("/:treeId", speciesController.getPhTreeSpecies);
    router.get("/:treeId/:id", speciesController.getSpecies);
    allowedMethods({ router });
    return router;
};