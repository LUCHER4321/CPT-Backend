import { sign, verify } from "jsonwebtoken";
import { Types } from "mongoose";
import { EXPIRATION, SECRET } from "../config";

interface TokenPayload {
    id: Types.ObjectId;
    role: string;
    date?: Date;
}

export const tokenSign = ({
    id,
    role,
    date = new Date()
} : TokenPayload): string => {
    return sign({
        id,
        role,
        date
    }, SECRET, {
        expiresIn: EXPIRATION
    });
};

export const tokenVerify = (token?: string) => {
    if (!token) throw new Error("Token is required");
    try {
        return verify(token, SECRET) as TokenPayload;
    } catch (error) {
        throw new Error("Invalid token");
    }
}