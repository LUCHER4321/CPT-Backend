import { model, Schema } from "mongoose";

const APIKeySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    }
});

export const APIKeyClass = model("APIKey", APIKeySchema);