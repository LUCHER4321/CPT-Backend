import cors from "cors";
import { ACCEPTED_ORIGINS, API } from "../config";

type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;
type CustomOrigin = (
    requestOrigin: string | undefined,
    callback: (err: Error | null, origin?: StaticOrigin) => void,
) => void;

const origin = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}): StaticOrigin | CustomOrigin | undefined => (origin, callback) => {
    if((!origin && API) || acceptedOrigins.includes(origin ?? "")) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
}

export const corsMw = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}) => cors({
    origin: origin({ acceptedOrigins }),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

export const corsWS = ({ acceptedOrigins = ACCEPTED_ORIGINS }: { acceptedOrigins?: string[] } = {}): cors.CorsOptions | cors.CorsOptionsDelegate<any> => ({
    origin: origin({ acceptedOrigins }),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
});