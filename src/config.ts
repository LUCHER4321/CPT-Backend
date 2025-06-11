import 'dotenv/config';

export const PORT = +(process.env.PORT ?? 3000);
export const URL = process.env.MONGO_URL ?? "";
export const SECRET = process.env.JWT_SECRET ?? "defaultsecret";
export const EXPIRATION = +(process.env.JWT_EXPIRATION ?? 3600 * 24);
export const IMAGES = process.env.IMAGES_BASE_URL ?? `http://localhost:${PORT}/api/life-trees/images`;
export const ACCEPTED_ORIGINS = process.env.ACCEPTED_ORIGINS?.split(",") ?? [`http://localhost:${PORT}`];