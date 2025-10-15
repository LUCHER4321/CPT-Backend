import { Router } from "express";
import { ContactController } from "../types";

export const createContactRoutes = ({
    contactController
}: { contactController: ContactController }) => {
    const router = Router();
    router.post("/", contactController.contact);
    return router;
}