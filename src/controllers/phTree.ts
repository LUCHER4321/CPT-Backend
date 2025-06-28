import { PhTreeController, PhTreeModel } from "../types";
import { nullableInput } from "../utils/nullableInput";
import { getKey, parseCriteria, parseNewTree, parseOrder, parsePatchTree, toObjectId } from "../utils/parser";

export const phTreeController = ({
    phTreeModel
}: { phTreeModel: PhTreeModel }): PhTreeController => ({
    createPhTree: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const {
                collaborators,
                ...data
            } = parseNewTree(req.body);
            const newPhTree = await phTreeModel.createPhTree({
                token,
                ...data,
                collaborators: collaborators?.map(toObjectId),
                key
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
            page,
            limit = 10,
            search,
            criteria = "createdAt",
            order = "desc",
            from,
            to
        } = req.query;
        try {
            const phTrees = await phTreeModel.getMyPhTrees({
                token,
                page: nullableInput(page, p => +p),
                limit: +limit,
                search: nullableInput(search, s => s as string),
                criteria: parseCriteria(criteria),
                order: parseOrder(order),
                from: nullableInput(from, f => new Date(f as string)),
                to: nullableInput(to, t => new Date(t as string))
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    updatePhTree: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            const {
                newCollaborators,
                deleteCollaborators,
                ...data
            } = parsePatchTree(req.body);
            const updatedPhTree = await phTreeModel.updatePhTree({
                token,
                id,
                ...data,
                newCollaborators: newCollaborators?.map(toObjectId),
                deleteCollaborators: deleteCollaborators?.map(toObjectId),
                key
            });
            if (!updatedPhTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(updatedPhTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhTree: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            await phTreeModel.deletePhTree({ token, id, key });
            res.status(204).json({ message: "Tree deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    setPhTreeImage: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        const { file: image } = req;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        if (!image) return res.status(400).json({ message: "Image file is required" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            const updatedPhTree = await phTreeModel.setPhTreeImage({ id, token, image, key });
            if (!updatedPhTree) return res.status(404).json({ message: "PhTree not found" });
            res.json(updatedPhTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    deletePhTreeImage: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            const phTree = await phTreeModel.deletePhTreeImage({ token, id, key });
            if (!phTree) return res.status(404).json({ message: "PhTree not found" });
            res.json(phTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTrees: async (req, res) => {
        const { token } = req.cookies;
        const {
            page,
            limit = 10,
            search,
            criteria = "createdAt",
            order = "desc",
            from,
            to
        } = req.query;
        try {
            const phTrees = await phTreeModel.getPhTrees({
                token,
                page: nullableInput(page, p => +p),
                limit: +limit,
                search: nullableInput(search, s => s as string),
                criteria: parseCriteria(criteria),
                order: parseOrder(order),
                from: nullableInput(from, f => new Date(f as string)),
                to: nullableInput(to, t => new Date(t as string))
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    getPhTree: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        try {
            const id = toObjectId(_id)
            const phTree = await phTreeModel.getPhTree({ token, id });
            if (!phTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(phTree);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    setView: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const id = toObjectId(_id);
            const views = await phTreeModel.setView({ token, id, key});
            if(!views) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json({ views });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
});