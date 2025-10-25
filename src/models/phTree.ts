import { Types } from "mongoose";
import { PhTreeClass } from "../schemas/phTree";
import { PhTree, PhTreeModel, TreeSearch } from "../types";
import { photoToString } from "../utils/photo";
import { imageModel } from "./image";
import { nullableInput } from "../utils/nullableInput";
import { CommentClass } from "../schemas/comment";
import { LikeClass } from "../schemas/like";
import { userByToken } from "../utils/token";
import { confirmAPIKey } from "../utils/apiKey";
import { Order, TreeCriteria } from "../enums";
import { UserClass } from "../schemas/user";
import { COMMENTS_P, LIKES_P, VIEWS_P } from "../config";

interface MyTreeProps {
    token?: string;
    id: Types.ObjectId;
    mustBeOwner?: boolean;
    readOnly?: boolean;
}

const inverseLN = (x: number) => 1 / Math.log(x + Math.E);

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
        if(![phTree.userId, ...(mustBeOwner ? [] : phTree.collaborators ?? [])].map(i => i.toString()).includes(user._id.toString()) && !phTree.isPublic) throw new Error(`${phTree.name} isn't a ${user.username}'s Ph. Tree`);
        return { user, phTree };
    }
    return { phTree };
}

interface GetTreesProps extends TreeSearch {
    token?: string
    myTrees?: boolean;
    owner?: boolean;
    host?: string;
}

const getTrees = async ({
    token,
    page,
    limit,
    userId,
    search,
    criteria,
    order,
    from,
    to,
    myTrees = false,
    owner,
    host
}: GetTreesProps): Promise<{
    trees: PhTree[];
    count: number;
}> => {
    const user = await nullableInput(token, userByToken);
    if(myTrees && !user) throw new Error("Invalid Token");
    const searchRegex = nullableInput(search, s => new RegExp(s, "i"));
    const users = await UserClass.find({ username: searchRegex });
    const usersId = users.map(user => user._id.toString());
    const queries = {
        ...(userId ? { userId } : {}),
        ...(searchRegex ? {
            $or: [
                { name: searchRegex },
                { tags: searchRegex },
                { userId: { $in: usersId } }
            ]
        } : {}),
        ...(!user ? { isPublic: true } : {}),
        ...(user && myTrees ? {
            $or: [
                ...(owner === true || owner === undefined ? [{ userId: user._id }] : []),
                ...(owner === false || owner === undefined ? [{ collaborators: user._id }] : [])
            ].filter(cond => Object.keys(cond).length > 0)
        } : {}),
        ...(from ? { createdAt: { $gte: from } } : {}),
        ...(to ? { createdAt: { $lte: to } } : {})
    };
    const treesQuery = PhTreeClass.find(queries);
    const totalResults = await PhTreeClass.countDocuments(queries);
    const skip = (page ?? 0) * (limit ?? 10);
    const query = async () => {
        switch (criteria) {
            case TreeCriteria.LIKES:
                return await treesQuery.lean().then(async (trees) => {
                    const treesWithLikes = await Promise.all(
                        trees.map(async (tree) => {
                            const likeCount = await LikeClass.countDocuments({ treeId: tree._id })
                            return { ...tree, likeCount };
                        })
                    );
                    return treesWithLikes.sort((a, b) => (a.likeCount - b.likeCount) * (order === Order.ASC ? 1 : -1)).map(t => {
                        const { likeCount, ...tree } = t;
                        return tree;
                    }).slice(skip, skip + (limit ?? 10));
                });
            case TreeCriteria.COMMENTS:
                return await treesQuery.lean().then(async (trees) => {
                    const treesWithComments  = await Promise.all(
                        trees.map(async (tree) => {
                            const commentCount = await CommentClass.countDocuments({ treeId: tree._id, content: { $exists: true }  })
                            return { ...tree, commentCount };
                        })
                    );
                    return treesWithComments.sort((a, b) => (a.commentCount - b.commentCount) * (order === Order.ASC ? 1 : -1)).map(t => {
                        const { commentCount, ...tree } = t;
                        return tree;
                    }).slice(skip, skip + (limit ?? 10));
                });
            case TreeCriteria.VIEWS:
                return await treesQuery.lean().then(async (trees) => {
                    return trees.sort((a,b) => (a.views.length - b.views.length) * (order === Order.ASC ? 1 : -1)).slice(skip, skip + (limit ?? 10));
                });
            case TreeCriteria.POPULARITY:
                return await treesQuery.lean().then(async (trees) => {
                    const now = Date.now() / 1000;
                    const treesWithPopularity = await Promise.all(trees.map(async (tree) => {
                        const viewsP = tree.views.length > 0 ? VIEWS_P * tree.views.map(v => {
                            const time = now - v.date.getTime() / 1000;
                            return inverseLN(time);
                        }).reduce((a, b) => a + b) : 0;
                        const comments = await CommentClass.find({ treeId: tree._id, content: { $exists: true } });
                        const commentsP = comments.length > 0 ? COMMENTS_P * comments.map(c => {
                            const time = now - c.createdAt.getTime() / 1000;
                            return inverseLN(time);
                        }).reduce((a, b) => a + b) : 0;
                        const likes = await LikeClass.find({ treeId: tree._id });
                        const likesP = likes.length > 0 ? LIKES_P * likes.map(l => {
                            const time = now - l.createdAt.getTime() / 1000;
                            return inverseLN(time);
                        }).reduce((a, b) => a + b) : 0;
                        const popularity = viewsP + commentsP + likesP;
                        return { ...tree, popularity };
                    }));
                    return treesWithPopularity.sort((a, b) => (a.popularity - b.popularity) * (order === Order.ASC ? 1 : -1)).map(t => {
                        const { popularity, ...tree} = t;
                        return tree;
                    }).slice(skip, skip + (limit ?? 10));
                });
            default:
                const sortOptions: any = {};
                if(criteria) sortOptions[criteria] = order === Order.ASC ? 1 : -1;
                return await treesQuery.sort(sortOptions).skip(skip).limit(limit ?? 10);
        };
    };
    const trees = await query();
    return {
        trees: await Promise.all(trees.map(async (t) => ({
            id: t._id,
            userId: t.userId,
            name: t.name,
            image: photoToString(t.image ?? null, host ?? ""),
            description: t.description ?? undefined,
            isPublic: t.isPublic,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            tags: t.tags ?? undefined,
            collaborators: t.collaborators ?? undefined,
            likes: await LikeClass.countDocuments({ treeId: t._id }),
            comments: await CommentClass.countDocuments({ treeId: t._id, content: { $exists: true } }),
            views: t.views.length
        }))),
        count: totalResults
    }
};

export const phTreeModel: PhTreeModel = {
    createPhTree: async ({ token, name, description, isPublic, tags, collaborators, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
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
        if(!newPhTree.userId) throw new Error("User ID not found");
        return await phTreeModel.getPhTree({ token, id: newPhTree._id, host });
    },
    getMyPhTrees: async ({
        token,
        page,
        limit,
        search,
        criteria,
        order,
        from,
        to,
        owner,
        host
    }) => {
        return await getTrees({
            token,
            page,
            limit,
            search,
            criteria,
            order,
            from,
            to,
            myTrees: true,
            owner,
            host
        });
    },
    getMyTotalTrees: async ({ token }) => {
        const user = await userByToken(token);
        if(!user) throw new Error("Invalid Token");
        const myTrees = await PhTreeClass.countDocuments({ userId: user._id });
        const collabs = await PhTreeClass.countDocuments({ collaborators: user._id });
        const total = myTrees + collabs;
        return { total, myTrees, collabs };
    },
    getTotalTrees: async({ token, userId }) => {
        const tokenUser = await nullableInput(token, userByToken);
        const isPublic = tokenUser?._id.toString() === userId.toString() ? {} : { isPublic: true };
        const myTrees = await PhTreeClass.countDocuments({ userId, ...isPublic });
        const collabs = await PhTreeClass.countDocuments({ collaborators: userId, ...isPublic });
        const total = myTrees + collabs;
        return { total, myTrees, collabs };
    },
    updatePhTree: async ({
        token,
        id,
        name,
        description,
        isPublic,
        tags,
        newCollaborators,
        deleteCollaborators,
        key,
        host
    }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const {
            user,
            phTree
        } = mt;
        if(!user) return undefined;
        if(!phTree.userId) throw new Error("User ID not found");
        if(name) phTree.name = name;
        if(description) phTree.description = description;
        if(description === "") phTree.description = undefined;
        if(isPublic !== undefined) phTree.isPublic = isPublic;
        if(tags) phTree.tags = tags.length > 0 ? tags : undefined;
        if(newCollaborators) {
            if(!phTree.collaborators) phTree.collaborators = newCollaborators.filter(c => c.toString() !== user._id.toString());
            else phTree.collaborators.push(...newCollaborators.filter(c => !phTree.collaborators?.includes(c) && c.toString() !== user._id.toString()));
        }
        if(deleteCollaborators && user._id.toString() === phTree.userId.toString()) phTree.collaborators = phTree.collaborators?.filter(c => !deleteCollaborators.includes(c));
        if(phTree.collaborators?.length === 0) phTree.collaborators = undefined;
        phTree.updatedAt = new Date();
        await phTree.save()
        return await phTreeModel.getPhTree({ token, id, host });
    },
    deletePhTree: async ({ token, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
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
    setPhTreeImage: async ({ token, id, image, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const { user, phTree } = mt;
        if(!user) return undefined;
        if(!phTree.userId) throw new Error("User ID not found");
        phTree.image = (await imageModel.createImage({ token, file: image }))?.url;
        phTree.updatedAt = new Date();
        await phTree.save();
        return await phTreeModel.getPhTree({ token, id, host });
    },
    deletePhTreeImage: async ({ token, id, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const mt = await myTree({ token, id });
        if(!mt) return undefined;
        const { phTree } = mt;
        await imageModel.deleteImage({ token, img: phTree.image ?? "" });
        phTree.image = undefined;
        phTree.updatedAt = new Date();
        await phTree.save();
        return await phTreeModel.getPhTree({ token, id, host });
    },
    getPhTrees: async ({
        token,
        page,
        limit,
        search,
        userId,
        criteria,
        order,
        from,
        to,
        host
    }) => {
        return await getTrees({
            token,
            page,
            limit,
            search,
            userId,
            criteria,
            order,
            from,
            to,
            host
        });
    },
    getPhTree: async ({ token, id, host }) => {
        const mt = await myTree({ token, id, readOnly: true });
        if(!mt) return undefined;
        const { phTree } = mt;
        return {
            id: phTree._id,
            userId: phTree.userId,
            name: phTree.name,
            image: photoToString(phTree.image ?? null, host ?? ""),
            description: phTree.description ?? undefined,
            isPublic: phTree.isPublic,
            createdAt: phTree.createdAt,
            updatedAt: phTree.updatedAt,
            tags: phTree.tags ?? undefined,
            collaborators: phTree.collaborators ?? undefined,
            likes: await LikeClass.countDocuments({ treeId: phTree._id}),
            comments: await CommentClass.countDocuments({ treeId: phTree._id, content: { $exists: true } }),
            views: phTree.views.length
        }
    },
    setView: async ({ token, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const mt = await myTree({ token, id, readOnly: true });
        if(!mt) return undefined;
        const { user, phTree } = mt;
        if(!user) return phTree.views.length;
        if(phTree.views.map(({ viewerId }) => viewerId?.toString()).includes(user._id.toString())) {
            const index = Math.max(...phTree.views.map(({ viewerId }, index) => viewerId?.toString() === user._id.toString() ? index : 0));
            phTree.views.splice(index, 1);
        }
        phTree.views.push({ viewerId: user._id });
        await phTree.save();
        return phTree.views.length;
    }
}