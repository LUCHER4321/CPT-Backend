import multer from "multer";

const upload = multer({
    dest: "images/"
});

export const multerMw = upload.single("image");