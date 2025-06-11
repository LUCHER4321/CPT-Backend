import { Types } from "mongoose";
import { PhTreeClass } from "../schemas/phTree";
import { userByToken } from "../schemas/user";
import { PhTree, PhTreeModel, treeCriteria } from "../types";
import { photoToString } from "../utils/photo";
import { imageModel } from "./image";
import { nullableInput } from "../utils/nullableInput";
import { CommentClass } from "../schemas/comment";
import { LikeClass } from "../schemas/like";

interface MyTreeProps {
    token?: string;
    id: Types.ObjectId;
    mustBeOwner?: boolean;
    readOnly?: boolean;
}

const myTree = async ({
    token,
    id,
    mustBeOwner = false,
    readOnly = false
}: MyTreeProps) => {
    const phTree = await PhTreeClass.findById(id);
    if(!phTree) throw new Error("Ph. Tree not found");
    if(!readOnly || !phTree.isPublic){
        const user = await nullableInput(token, userByToken);
        if (!user) return undefined;
        if(![phTree.userId.prototype, ...(mustBeOwner ? [] : phTree.collaborators ?? [])].includes(user._id) && !phTree.isPublic) throw new Error(`${phTree.name} isn't a ${user.username}'s Ph. Tree`);
        return { user, phTree };
    }
    return { phTree };
}

interface GetTreesProps {
    token?: string
    page?: number;
    limit?: number;
    search?: string;
    criteria?: treeCriteria;
    order?: "asc" | "desc";
    myTrees?: boolean;
}

const getTrees = async ({
    token,
    page,
    limit,
    search,
    criteria,
    order,
    myTrees = false
}: GetTreesProps): Promise<(PhTree & { commentsCount: number })[]> => {
    const user = await nullableInput(token, userByToken);
    const orderN = order === "asc" ? 1 : -1;
    const filter = {
        name: nullableInput(search, s => ({ $regex: `.*${s}.*`, $options: "i" })),
        $or: nullableInput(user, u => [
            myTrees ? { isPublic: true } : {},
            { userId: u?._id },
            { collaborators: u?._id }
        ]),
        isPublic: (user && myTrees) ? undefined : true,
        tags: nullableInput(search, s => ({ $in: s.split(" ").map(word => `.*${word}.*`), $options: "i" }))
    };
    const pipeline: any[] = [
        { $match: filter },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "treeId",
                as: "comments"
            }
        },
        {
            $addFields: {
                commentsCount: { $size: "$comments" }
            }
        }
    ];
    let sortStage: any = {};
    switch(criteria) {
        case "createdAt":
            sortStage = { $sort: { createdAt: orderN } };
            break;
        case "updatedAt":
            sortStage = { $sort: { updatedAt: orderN } };
            break;
        case "name":
            sortStage = { $sort: { name: orderN } };
            break;
        case "comments":
            sortStage = { $sort: { commentsCount: orderN } };
            break;
        default:
            sortStage = { $sort: { createdAt: -1 } };
    }
    pipeline.push(sortStage);
    if (page !== undefined && limit !== undefined) {
        pipeline.push({ $skip: page * limit });
        pipeline.push({ $limit: limit });
    }
    const phTrees = await PhTreeClass.aggregate(pipeline);
    return phTrees.filter(pt => pt.userId.prototype !== undefined).map(pt => ({
        id: pt._id,
        userId: pt.userId.prototype,
        name: pt.name,
        image: pt.image ?? undefined,
        description: pt.description ?? undefined,
        isPublic: pt.isPublic,
        createdAt: pt.createdAt,
        updatedAt: pt.updatedAt,
        tags: pt.tags ?? undefined,
        collaborators: pt.collaborators?.filter((c: any) => c.prototype).map((c: any) => c.prototype!) ?? undefined,
        commentsCount: pt.commentsCount
    }));
};

export const phTreeModel: PhTreeModel = {
    createPhTree: async ({ token, name, description, isPublic, tags, collaborators }) => {
        const user = await nullableInput(token, userByToken);
        if (!user) return undefined;
        const phTree = new PhTreeClass({
            userId: user._id,
            name,
            description,
            isPublic,
            tags: nullableInput(tags, t => t.length > 0 ? t : undefined),
            collaborators: nullableInput(collaborators, c => c.length > 0 ? c : undefined)
        });
        const newPhTree = await phTree.save();
        if(!newPhTree.userId.prototype) throw new Error("User ID not found");
        return await phTreeModel.getPhTree({ token, id: newPhTree._id });
    },
    getMyPhTrees: async ({ token, page, limit, search, criteria, order }) => {
        return await getTrees({
            token,
            page,
            limit,
            search,
            criteria,
            order,
            myTrees: true
        });
    },
    updatePhTree: async ({ token, id, name, description, isPublic, tags, newCollaborators, deleteCollaborators }) => {
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const {
            user,
            phTree
        } = mt;
        if(!user) return undefined;
        if(!phTree.userId.prototype) throw new Error("User ID not found");
        if(name) phTree.name = name;
        if(description) phTree.description = description;
        if(description === "") phTree.description = undefined;
        if(isPublic !== undefined) phTree.isPublic = isPublic;
        if(tags) phTree.tags = tags.length > 0 ? tags : undefined;
        if(newCollaborators) phTree.collaborators?.push(...newCollaborators);
        if(deleteCollaborators && user._id === phTree.userId.prototype) phTree.collaborators?.remove(...deleteCollaborators);
        if(phTree.collaborators?.length === 0) phTree.collaborators = undefined;
        phTree.updatedAt = new Date();
        await phTree.save()
        return await phTreeModel.getPhTree({ token, id });
    },
    deletePhTree: async ({ token, id }) => {
        const mt = await myTree({ token, id, mustBeOwner: true });
        if(!mt) return;
        const { user, phTree } = mt;
        if(!user) return;
        const { deletedCount } = await PhTreeClass.deleteOne({ _id: phTree._id, userId: user._id });
        if(deletedCount === 0) throw new Error("Ph. Tree not found");
        await LikeClass.deleteMany({ treeId: id });
        await LikeClass.deleteMany({ $or: (await CommentClass.find({ treeId: id })).map(c => ({ commentId: c._id })) })
        await CommentClass.deleteMany({ treeId: id });
    },
    setPhTreeImage: async ({ token, id, image }) => {
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const { user, phTree } = mt;
        if(!user) return undefined;
        if(!phTree.userId.prototype) throw new Error("User ID not found");
        phTree.image = (await imageModel.createImage({ token, file: image }))?.url;
        phTree.updatedAt = new Date();
        await phTree.save();
        return await phTreeModel.getPhTree({ token, id });
    },
    deletePhTreeImage: async ({ token, id }) => {
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const { phTree } = mt;
        await imageModel.deleteImage({ token, img: phTree.image ?? "" });
        phTree.image = undefined;
        phTree.updatedAt = new Date();
        phTree.userId.prototype
        await phTree.save();
    },
    getPhTrees: async ({ token, page, limit, search, criteria, order }) => {
        return await getTrees({
            token,
            page,
            limit,
            search,
            criteria,
            order
        });
    },
    getPhTree: async ({ token, id }) => {
        const mt = await myTree({ token, id, readOnly: true });
        if(!mt) return undefined;
        const { phTree } = mt;
        if(!phTree.userId.prototype) throw new Error("User ID not found");
        return {
            id: phTree._id,
            userId: phTree.userId.prototype,
            name: phTree.name,
            image: photoToString(phTree.image),
            description: phTree.description ?? undefined,
            isPublic: phTree.isPublic,
            createdAt: phTree.createdAt,
            updatedAt: phTree.updatedAt,
            tags: phTree.tags ?? undefined,
            collaborators: phTree.collaborators?.filter(c => c.prototype).map(c => c.prototype!) ?? undefined
        }
    }
}