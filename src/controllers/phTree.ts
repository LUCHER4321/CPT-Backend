import { TreeChange } from "../enums";
import { PhTreeController, PhTreeModel, SpeciesMongo, SpeciesMongoInput } from "../types";
import { getSocketData } from "../utils/getSocketData";
import { nullableInput } from "../utils/nullableInput";
import { getKey, parseCriteria, parseNewTree, parseOrder, parsePatchTree, parsePhTreeChange, toObjectId } from "../utils/parser";

const toMongo = (sp: SpeciesMongoInput): SpeciesMongo => {
    const {id, treeId, ancestorId, descendants, ...rest} = sp;
    return {
        id: toObjectId(id),
        treeId: toObjectId(treeId),
        descendants: descendants?.map(toMongo),
        ...rest
    }
};

export const phTreeController = ({
    phTreeModel
}: { phTreeModel: PhTreeModel }): PhTreeController => ({
    setChange: async ({socket, call}) => {
        const {
            data,
            emit,
            token
        } = getSocketData(socket);
        if(!token) return;
        const { type, species, phTree } = parsePhTreeChange(data);
        if(!type) return;
        switch(type) {
            case TreeChange.TREE:
                if(!phTree) return;
                emit(call + "-" + phTree.id, {
                    change: type,
                    phTree
                });
                break;
            default:
                if(!species) return;
                emit(call + "-" + species.treeId, {
                    change: type,
                    species,
                });
                break;
        }
    },
    createPhTree: async (req, res) => {
        const { token } = req.cookies;
        if(!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { host } = req.headers;
        try {
            const {
                collaborators,
                ...data
            } = parseNewTree(req.body);
            const newPhTree = await phTreeModel.createPhTree({
                token,
                ...data,
                collaborators: collaborators?.map(toObjectId),
                key,
                host
            });
            if (!newPhTree) return res.status(400).json({ message: "Failed to create Ph. Tree" });
            res.json(newPhTree);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getMyPhTrees: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { host } = req.headers;
        const {
            page = 0,
            limit = 10,
            search,
            criteria = "updatedAt",
            order = "desc",
            from,
            to,
            owner
        } = req.query;
        try {
            const phTrees = await phTreeModel.getMyPhTrees({
                token,
                page: +page,
                limit: +limit,
                search: search?.toString(),
                criteria: parseCriteria(criteria),
                order: parseOrder(order),
                from: nullableInput(from?.toString(), f => new Date(f)),
                to: nullableInput(to?.toString(), t => new Date(t)),
                owner: owner === "true" ? true : owner === "false" ? false : undefined,
                host
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getMyTotalTrees: async (req, res) => {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        try {
            const total = await phTreeModel.getMyTotalTrees({ token });
            if(!total) res.json({ total: 0, myTrees: 0, collabs: 0 })
            res.json(total);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getTotalTrees: async (req, res) => {
        const { userId: uid } = req.params;
        const { token } = req.cookies;
        try {
            const userId = toObjectId(uid);
            const total = await phTreeModel.getTotalTrees({ token, userId });
            if(!total) res.json({ total: 0, myTrees: 0, collabs: 0 })
            res.json(total);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    updatePhTree: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { host } = req.headers;
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
                key,
                host
            });
            if (!updatedPhTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(updatedPhTree);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
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
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
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
        const { host } = req.headers;
        try {
            const id = toObjectId(_id);
            const updatedPhTree = await phTreeModel.setPhTreeImage({ id, token, image, key, host });
            if (!updatedPhTree) return res.status(404).json({ message: "PhTree not found" });
            res.json(updatedPhTree);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    deletePhTreeImage: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        const { host } = req.headers;
        try {
            const id = toObjectId(_id);
            const phTree = await phTreeModel.deletePhTreeImage({ token, id, key, host });
            if (!phTree) return res.status(404).json({ message: "PhTree not found" });
            res.json(phTree);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getPhTrees: async (req, res) => {
        const { token } = req.cookies;
        const {
            page = 0,
            limit = 10,
            userId,
            search,
            criteria = "updatedAt",
            order = "desc",
            from,
            to
        } = req.query;
        const { host } = req.headers;
        try {
            const phTrees = await phTreeModel.getPhTrees({
                token,
                page: +page,
                limit: +limit,
                userId: nullableInput(userId?.toString(), toObjectId),
                search: search?.toString(),
                criteria: parseCriteria(criteria),
                order: parseOrder(order),
                from: nullableInput(from?.toString(), f => new Date(f)),
                to: nullableInput(to?.toString(), t => new Date(t)),
                host
            });
            if (!phTrees) return res.status(404).json({ message: "No Ph. Trees found" });
            res.json(phTrees);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    },
    getPhTree: async (req, res) => {
        const { id: _id } = req.params;
        const { token } = req.cookies;
        const { host } = req.headers;
        try {
            const id = toObjectId(_id)
            const phTree = await phTreeModel.getPhTree({ token, id, host });
            if (!phTree) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json(phTree);
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
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
            if(views === undefined) return res.status(404).json({ message: "Ph. Tree not found" });
            res.json({ views });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    }
});