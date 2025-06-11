import { model, Schema, Types } from "mongoose";

const SpeciesSchema = new Schema({
    ancestorId: Types.ObjectId,
    treeId: {
        type: Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    apparition: Number,
    afterApparition: Number,
    duration: {
        type: Number,
        required: true
    },
    description: String,
    image: String
});

export const SpeciesClass = model("Species", SpeciesSchema);