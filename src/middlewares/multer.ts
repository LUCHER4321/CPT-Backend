import multer from "multer";
import { IMAGES } from "../config";

const upload = multer({
    dest: IMAGES + "/"
});

export const multerMw = upload.single("image");