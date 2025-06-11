import { model, Schema, Types } from "mongoose";

const CommentSchema = new Schema({
    treeId: {
        type: Types.ObjectId,
        required: true
    },
    userId: Types.ObjectId,
    content: String,
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    parentId: Types.ObjectId
});

export const CommentClass = model("Comment", CommentSchema);