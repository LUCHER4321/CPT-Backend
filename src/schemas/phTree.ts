import { model, Schema } from "mongoose";

const PhTreeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: String,
    description: String,
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    tags: {
        type: [String],
        required: false
    },
    collaborators: {
        type: [Schema.Types.ObjectId],
        required: false
    }
});

export const PhTreeClass = model("PhTree", PhTreeSchema);