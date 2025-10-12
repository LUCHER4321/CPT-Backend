import { model, Schema } from "mongoose";
import { Billing, Plan, Role } from "../enums";

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
            validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: (props: any) => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    photo: String,
    description: String,
    plan: {
        type: String,
        enum: Object.values(Plan),
        default: Plan.FREE
    },
    billing: {
        type: String,
        enum: Object.values(Billing)
    },
    planExpiration: Date,
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    lastLogin: {
        type: Date,
        default: () => new Date()
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tokens: {
        type: [{
            token: String,
            expires: {
                type: Date,
                default: () => new Date(Date.now() + 36000000)
            }
        }],
        default: []
    },
    domain: String
});

export const UserClass = model("User", UserSchema);