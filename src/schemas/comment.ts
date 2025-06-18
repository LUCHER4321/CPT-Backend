import { model, Schema } from "mongoose";

const CommentSchema = new Schema({
    treeId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: Schema.Types.ObjectId,
    content: String,
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    parentId: Schema.Types.ObjectId
});

export const CommentClass = model("Comment", CommentSchema);