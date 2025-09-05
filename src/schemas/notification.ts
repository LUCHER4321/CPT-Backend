import { model, Schema } from "mongoose";
import { NotiFunc } from "../enums";

const {ObjectId} = Schema.Types;

const NotificationSchema = new Schema({
    fun: {
        type: String,
        enum: Object.values(NotiFunc),
        required: true
    },
    usersId: {
        type: [ObjectId],
        required: true
    },
    userId: ObjectId,
    treeId: ObjectId,
    commentId: ObjectId,
    inputs: [String],
    authorId: {
        type: ObjectId,
        required: true
    },
    seen: {
        type: [ObjectId],
        default: []
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
});

export const NotificationClass = model("Notification", NotificationSchema);