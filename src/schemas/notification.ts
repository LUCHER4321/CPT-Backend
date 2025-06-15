import { model, Schema, Types } from "mongoose";
import { NotiFunc } from "../utils/enums";

const NotificationSchema = new Schema({
    fun: {
        type: String,
        enum: Object.values(NotiFunc),
        required: true
    },
    usersId: {
        type: [Types.ObjectId],
        required: true
    },
    inputs: [String],
    authorId: {
        type: Types.ObjectId,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
});

export const NotificationClass = model("Notification", NotificationSchema);