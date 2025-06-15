import 'dotenv/config';

export const PORT = +(process.env.PORT ?? 3000);
export const URL = process.env.MONGO_URL ?? "";
export const SECRET = process.env.JWT_SECRET ?? "defaultsecret";
export const EXPIRATION = +(process.env.JWT_EXPIRATION ?? 3600);
export const IMAGES = process.env.IMAGES_URL ?? "api/life-tree/image";
export const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
export const ACCEPTED_ORIGINS = process.env.ACCEPTED_ORIGINS?.split(",") ?? [BASE];
export const setN = "set-notification";
export const getN = "get-notification";
export const server = "-server";
export const client = "-client";