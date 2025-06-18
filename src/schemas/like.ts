import { model, Schema } from "mongoose";

const LikeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    treeId: Schema.Types.ObjectId,
    commentId: Schema.Types.ObjectId,
    createdAt: {
        type: Date,
        default: () => new Date()
    }
});

export const LikeClass = model("Like", LikeSchema);