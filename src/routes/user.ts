import { Router } from "express";
import { UserController } from "../types";
import { multerMw } from "../middlewares/multer";
import { allowedMethods } from "../middlewares/options";

export const createUserRoutes = ({
    userController,
}: { userController: UserController }) => {
    const router = Router();
    router.use("/me", createUserMeRoutes({ userController }));
    router.post("/register", userController.register);
    router.post("/login", userController.login);
    router.post("/logout", userController.logout);
    router.get("/:id", userController.getUser);
    router.post("/admin", userController.makeAdmin);
    router.post("/token", userController.generateToken);
    return router;
}

const createUserMeRoutes = ({
    userController
}: { userController: UserController }) => {
    const router = Router();
    router.get("/", userController.getMe);
    router.patch("/", userController.updateMe);
    router.delete("/", userController.deleteMe);
    router.post("/photo", multerMw, userController.photoMe);
    router.delete("/photo", userController.deletePhotoMe);
    router.post("/key", userController.generateKey);
    router.delete("/key/:keyTD", userController.deleteKey);
    allowedMethods({ router });
    return router;
}