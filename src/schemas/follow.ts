import { model, Schema } from "mongoose";

const FollowSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    followedUserId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

export const FollowClass = model("Follow", FollowSchema);