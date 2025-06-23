import { model, Schema } from "mongoose";
import { Plan, Role } from "../utils/enums";

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
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    photo: String,
    plan: {
        type: String,
        enum: Object.values(Plan),
        default: Plan.FREE
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
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