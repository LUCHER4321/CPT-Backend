import { model, Schema, Types } from "mongoose";

const LikeSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true
    },
    treeId: Types.ObjectId,
    commentId: Types.ObjectId,
    createdAt: {
        type: Date,
        default: () => new Date()
    }
});

export const LikeClass = model("Like", LikeSchema);