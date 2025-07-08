import { Request, Response } from "express";
import { join } from "node:path";

export const notFound = (_: Request, res: Response) => {
    res.status(404).sendFile(join(__dirname, "..", "pages", "404.html"));
};