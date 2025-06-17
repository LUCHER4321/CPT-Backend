import { BASE } from "../config";
import { nullableInput } from "./nullableInput";

export const photoToString = (photo: string | null | undefined) => nullableInput(photo, p => `${BASE}/${p}`);