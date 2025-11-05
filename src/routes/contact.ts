import { Router } from "express";
import { ContactController } from "../types";
import { allowedMethods } from "../middlewares/options";

export const createContactRoutes = ({
    contactController
}: { contactController: ContactController }) => {
    const router = Router();
    router.post("/", contactController.contact);
    allowedMethods({ router, methods: ["POST"] });
    return router;
}