import { Types } from "mongoose";
import { APIKeyClass } from "../schemas/apiKey";
import { UserClass } from "../schemas/user";
import { Role } from "../enums";

export const confirmAPIKey = async (key?: Types.ObjectId) => {
    if(!key) return false;
    const apiKey = await APIKeyClass.findById(key);
    if(!apiKey) return false;
    const user = await UserClass.findById(apiKey.userId);
    if(!user) return false;
    return user.role !== Role.USER;
};