import { model, Schema } from "mongoose";

const SpeciesSchema = new Schema({
    ancestorId: Schema.Types.ObjectId,
    treeId: {
        type: Schema.Types.ObjectId,
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