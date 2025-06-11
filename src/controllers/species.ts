import { Types } from "mongoose";
import { SpeciesController, SpeciesModel } from "../types"
import { parseNewSpecies, parsePatchSpecies } from "../utils/parser";

const setAncestor = (ancestor: any) => typeof ancestor === "string" ? new Types.ObjectId(ancestor) : undefined;

export const speciesController = ({
    speciesModel
}: { speciesModel: SpeciesModel }): SpeciesController => ({
    createSpecies: async (req, res) => {
        const { token } = req.cookies;
        const { treeId } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const {
                name,
                ancestorId,
                apparition,
                afterApparition,
                duration,
                description
            } = parseNewSpecies(req.body);
            if(!ancestorId && !apparition) return res.status(400).json({ message: "Apparition is required if there's no ancestor" });
            if(ancestorId && !afterApparition) return res.status(400).json({ message: "After Apparition is required if there's an ancestor" });
            const species = await speciesModel.createSpecies({
                token,
                treeId: new Types.ObjectId(treeId),
                name,
                ancestorId: setAncestor(ancestorId),
                apparition,
                afterApparition,
                duration,
                description
            });
            if(!species) return res.status(404).json({ message: "PhTree not found" });
            res.json(species);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updateSpecies: async (req, res) => {
        const { token } = req.cookies;
        const {
            treeId,
            id
        } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const {
                name,
                ancestorId,
                apparition,
                afterApparition,
                duration,
                description
            } = parsePatchSpecies(req.body);
            const updatedSpecies = await speciesModel.updateSpecies({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id),
                name,
                ancestorId: setAncestor(ancestorId),
                apparition,
                afterApparition,
                duration,
                description
            });
            if(!updatedSpecies) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(updatedSpecies);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteSpecies: async (req, res) => {
        const { token } = req.cookies;
        const {
            treeId,
            id
        } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await speciesModel.deleteSpecies({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id)
            });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    setSpeciesImage: async (req, res) => {
        const { token } = req.cookies;
        const {
            treeId,
            id
        } = req.params;
        const { file: image } = req;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!image) return res.status(400).json({ message: "Image file is required" });
        try {
            const updatedSpecies = await speciesModel.setSpeciesImage({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id),
                image
            });
            if(!updatedSpecies) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(updatedSpecies);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deleteSpeciesImage: async (req, res) => {
        const { token } = req.cookies;
        const {
            treeId,
            id
        } = req.params;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            await speciesModel.deleteSpeciesImage({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id)
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getSpecies: async (req, res) => {
        const { token } = req.cookies;
        const {
            treeId,
            id
        } = req.params;
        try {
            const species = speciesModel.getSpecies({
                token,
                treeId: new Types.ObjectId(treeId),
                id: new Types.ObjectId(id)
            });
            if(!species) return res.status(404).json({ message: "PhTree or Species not found" });
            res.json(species);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTreeSpecies: async (req, res) => {
        const { token } = req.cookies;
        const { treeId } = req.params;
        try {
            const speciesList = speciesModel.getPhTreeSpecies({
                token,
                treeId: new Types.ObjectId(treeId)
            });
            if(!speciesList) return res.status(404).json({ message: "PhTree not found" });
            res.json(speciesList);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});