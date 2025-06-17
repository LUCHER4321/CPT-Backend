import { Types } from "mongoose";
import { SpeciesController, SpeciesModel } from "../types"
import { getKey, parseNewSpecies, parsePatchSpecies, toObjectId } from "../utils/parser";
import { nullableInput, nullableInputCanBeNull } from "../utils/nullableInput";

type Input = Partial<{
    ancestorId: string;
    apparition: number;
    afterApparition: number;
    description: string;
    descendants: Omit<Input, "ancestorId">[];
}> & {
    name: string;
    duration: number;
};

type Output = Omit<Input, "ancestorId"> & { ancestorId?: Types.ObjectId };

type PartialOutput = Omit<Partial<Input>, "ancestorId"> & { ancestorId?: Types.ObjectId | null };

const toOutput = ({
    ancestorId,
    descendants,
    ...data
}: Input): Output => ({
    ancestorId: nullableInput(ancestorId, toObjectId),
    descendants: descendants?.map(toOutput),
    ...data
});

const toPartialOutput = ({
    ancestorId,
    descendants,
    ...data
}: Partial<Input>): PartialOutput => ({
    ancestorId: nullableInputCanBeNull(ancestorId, a => new Types.ObjectId(a)),
    descendants: descendants?.map(toOutput),
    ...data
});

export const speciesController = ({
    speciesModel
}: { speciesModel: SpeciesModel }): SpeciesController => ({
    createSpecies: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { token } = req.cookies;
        const { treeId: t_id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const parse = parseNewSpecies(req.body);
            if(!parse.ancestorId && !parse.apparition) return res.status(400).json({ message: "Apparition is required if there's no ancestor" });
            if(parse.ancestorId && !parse.afterApparition) return res.status(400).json({ message: "After Apparition is required if there's an ancestor" });
            const output = toOutput(parse);
            const treeId = toObjectId(t_id)
            const species = await speciesModel.createSpecies({ token, treeId, ...output, key });
            if(!species) return res.status(404).json({ message: "PhTree not found" });
            res.json(species);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updateSpecies: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            const parse = parsePatchSpecies(req.body);
            const updatedSpecies = await speciesModel.updateSpecies({
                token,
                treeId,
                id,
                ...toPartialOutput(parse),
                key
            });
            if(!updatedSpecies) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(updatedSpecies);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteSpecies: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            await speciesModel.deleteSpecies({ token, treeId, id, key });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    setSpeciesImage: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        const { file: image } = req;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!image) return res.status(400).json({ message: "Image file is required" });
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            const updatedSpecies = await speciesModel.setSpeciesImage({ token, treeId, id, image, key });
            if(!updatedSpecies) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(updatedSpecies);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteSpeciesImage: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            await speciesModel.deleteSpeciesImage({ token, treeId, id, key });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getSpecies: async (req, res) => {
        const { token } = req.cookies;
        const { treeId: t_id, id: _id } = req.params;
        try {
            const treeId = toObjectId(t_id);
            const id = toObjectId(_id);
            const species = speciesModel.getSpecies({ token, treeId, id });
            if(!species) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(species);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTreeSpecies: async (req, res) => {
        const { token } = req.cookies;
        const { treeId: _id } = req.params;
        try {
            const treeId = toObjectId(_id);
            const speciesList = speciesModel.getPhTreeSpecies({ token, treeId });
            if(!speciesList) return res.status(404).json({ message: "PhTree not found" });
            res.json(speciesList);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});