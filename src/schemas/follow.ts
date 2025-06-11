import { model, Schema, Types } from "mongoose";

const FollowSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        required: true
    },
    followedUserId: {
        type: Types.ObjectId,
        required: true
    }
});

export const FollowClass = model("Follow", FollowSchema);