import { BASE, IMAGES } from "../config";
import { nullableInput } from "./nullableInput";

export const photoToString = (photo: string | null | undefined) => nullableInput(photo, p => `${BASE}/${IMAGES}/${p}`);