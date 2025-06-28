import { model, Schema } from "mongoose";
const { ObjectId } = Schema.Types;

const PhTreeSchema = new Schema({
    userId: {
        type: ObjectId,
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
        type: [ObjectId],
        required: false
    },
    views: {
        type: [ObjectId],
        default: []
    }
});

export const PhTreeClass = model("PhTree", PhTreeSchema);