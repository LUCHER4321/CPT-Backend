import 'dotenv/config';

export const PORT = +(process.env.PORT ?? 3000);
export const SOCKET_PORT = +(process.env.SOCKET_PORT ?? 4000);
export const URL = process.env.MONGO_URL ?? "";
export const SECRET = process.env.JWT_SECRET ?? "defaultsecret";
export const EXPIRATION = +(process.env.JWT_EXPIRATION ?? 3600);
export const IMAGES = process.env.IMAGES_URL ?? "api/life-tree/image";
export const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
export const ACCEPTED_ORIGINS = process.env.ACCEPTED_ORIGINS?.split(",") ?? [BASE];
export const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUD_KEY = process.env.CLOUDINARY_API_KEY ?? "";
export const CLOUD_SECRET = process.env.CLOUDINARY_SECRET_KEY ?? "";
export const VIEWS_P = +(process.env.VIEWS_PONDERATION ?? 1);
export const COMMENTS_P = +(process.env.COMMENTS_PONDERATION ?? 2);
export const LIKES_P = +(process.env.LIKES_PONDERATION ?? 1.5);
export const MAILER_USER = process.env.MAILER_USER;
export const MAILER_PASS = process.env.MAILER_PASS;
export const setN = "set-notification";
export const setC = "set-tree-change"
export const server = "-server";
export const client = "-client";