import { BASE } from "../config";
import { nullableInput } from "./nullableInput";

export const photoToString = (photo?: string | null, host?: string) => nullableInput(photo, p => `http://${host ?? BASE}/${p}`);