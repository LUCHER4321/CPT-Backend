import { model, Schema } from "mongoose";
import { tokenVerify } from "../utils/token";

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate: {
            validator: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test,
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    lastLogin: {
        type: Date,
        default: () => new Date()
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

export const UserClass = model("User", UserSchema);

export const userByToken = async (token: string) => {
    const decoded = tokenVerify(token);
    if (!decoded) throw new Error("Invalid token");
    const user = await UserClass.findById(decoded.id);
    return user;
};