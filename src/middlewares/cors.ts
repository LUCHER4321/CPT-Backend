import cors from "cors";
import { ACCEPTED_ORIGINS, API } from "../config";
import e from "cors";

type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;

type CustomOrigin = (
    requestOrigin: string | undefined,
    callback: (err: Error | null, origin?: StaticOrigin) => void,
) => void;

const origin = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}): StaticOrigin | CustomOrigin | undefined => (origin, callback) => {
    if(!origin || !API) return callback(null, true);
    if(acceptedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
}

export const corsMw = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}) => cors({
    origin: origin({ acceptedOrigins }),
    credentials: true
});

export const corsWS = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}): e.CorsOptions | e.CorsOptionsDelegate | undefined => ({
    origin: origin({ acceptedOrigins }),
    credentials: true
})