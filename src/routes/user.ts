import { Router } from "express";
import { UserController } from "../types";
import { multerMw } from "../middlewares/multer";
import { allowedMethods } from "../middlewares/options";

export const createUserRoutes = ({
    userController,
}: { userController: UserController }) => {
    const router = Router();
    router.post("/register", userController.register);
    router.post("/login", userController.login);
    router.post("/logout", userController.logout);
    router.get("/:id", userController.getUser);
    router.use("/me", createUserMeRoutes({ userController }));
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
    allowedMethods({ router });
    return router;
}