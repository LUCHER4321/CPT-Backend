import { Router } from "express";
import { PhTreeController } from "../types";
import { multerMw } from "../middlewares/multer";
import { allowedMethods } from "../middlewares/options";
import { Socket } from "socket.io";
import { client, server, setC } from "../config";

interface IOProps {
    socket: Socket;
    phTreeController: PhTreeController;
}

export const createPhTreeIO = ({
    socket,
    phTreeController
}: IOProps) => socket.on(setC + client, async(key) => await phTreeController.setChange({ socket, call: setC + server, key }));

export const createPhTreeRoutes = ({
    phTreeController
}: Omit<IOProps, "socket">) => {
    const router = Router();
    router.post("/", phTreeController.createPhTree);
    router.get("/me", phTreeController.getMyPhTrees);
    router.get("/me/total", phTreeController.getMyTotalTrees);
    router.get("/:userId/total", phTreeController.getTotalTrees);
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