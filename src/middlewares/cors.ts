import cors from "cors";
import { ACCEPTED_ORIGINS } from "../config";

export const corsMw = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}) => cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(acceptedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS origin not allowed"));
    },
});