import { Types } from "mongoose";
import { PhTreeController, PhTreeModel, treeCriteria } from "../types";
import { parseNewTree, parsePatchTree } from "../utils/parser";

export const phTreeController = ({
    phTreeModel
}: { phTreeModel: PhTreeModel }): PhTreeController => ({
    createPhTree: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const {
                name,
                description,
                isPublic,
                tags,
                collaborators
            } = parseNewTree(req.body);
            const newPhTree = await phTreeModel.createPhTree({
                token,
                name,
                description,
                isPublic,
                tags,
                collaborators: collaborators?.map(c => new Types.ObjectId(c))
            });
            if (!newPhTree) return res.status(400).json({ message: "Failed to create Ph. Tree" });
            res.json(newPhTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getMyPhTrees: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const {
            page = 1,
            limit = 10,
            search = "",
            criteria = "createdAt",
            order = "desc"
        } = req.query;
        try {
            const phTrees = await phTreeModel.getMyPhTrees({
                token,
                page: +page,
                limit: +limit,
                search: search as string,
                criteria: criteria as treeCriteria,
                order: order as "asc" | "desc"
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updatePhTree: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id) return res.status(400).json({ message: "Ph. Tree ID is required" });
        try {
            const {
                name,
                description,
                isPublic,
                tags,
                newCollaborators,
                deleteCollaborators
            } = parsePatchTree(req.body);
            const updatedPhTree = await phTreeModel.updatePhTree({
                token,
                id: new Types.ObjectId(id),
                name,
                description,
                isPublic,
                tags,
                newCollaborators: newCollaborators?.map(c => new Types.ObjectId(c)),
                deleteCollaborators: deleteCollaborators?.map(c => new Types.ObjectId(c))
            });
            if (!updatedPhTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(updatedPhTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhTree: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id) return res.status(400).json({ message: "Ph. Tree ID is required" });
        try {
            await phTreeModel.deletePhTree({ token, id: new Types.ObjectId(id) });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    setPhTreeImage: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        const { file: image } = req;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id) return res.status(400).json({ message: "Ph. Tree ID is required" });
        if (!image) return res.status(400).json({ message: "Image file is required" });
        try {
            const updatedPhTree = await phTreeModel.setPhTreeImage({
                id: new Types.ObjectId(id),
                token,
                image
            });
            if (!updatedPhTree) return res.status(404).json({ message: "PhTree not found" });
            res.json(updatedPhTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhTreeImage: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!id) return res.status(400).json({ message: "Ph. Tree ID is required" });
        try {
            await phTreeModel.deletePhTreeImage({ token, id: new Types.ObjectId(id) });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTrees: async (req, res) => {
        const { token } = req.cookies;
        const {
            page = 1,
            limit = 10,
            search = "",
            criteria = "createdAt",
            order = "desc"
        } = req.query;
        try {
            const phTrees = await phTreeModel.getPhTrees({
                token,
                page: +page,
                limit: +limit,
                search: search as string,
                criteria: criteria as treeCriteria,
                order: order as "asc" | "desc"
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTree: async (req, res) => {
        const { id } = req.params;
        const { token } = req.cookies;
        if (!id) return res.status(400).json({ message: "Ph. Tree ID is required" });
        try {
            const phTree = await phTreeModel.getPhTree({
                token,
                id: new Types.ObjectId(id)
            });
            if (!phTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(phTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
});