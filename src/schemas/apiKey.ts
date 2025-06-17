import { model, Schema, Types } from "mongoose";

const APIKeySchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    }
});

export const APIKeyClass = model("APIKey", APIKeySchema);