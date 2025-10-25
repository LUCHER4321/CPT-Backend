import { Types } from "mongoose";
import { PhTreeClass } from "../schemas/phTree";
import { SpeciesClass } from "../schemas/species";
import { SpeciesModel, SpeciesMongo } from "../types";
import { nullableInput } from "../utils/nullableInput";
import { Species } from "chrono-phylo-tree";
import { imageModel } from "./image";
import { photoToString } from "../utils/photo";
import { userByToken } from "../utils/token";
import { confirmAPIKey } from "../utils/apiKey";

interface CheckProps {
    token?: string;
    treeId: Types.ObjectId;
    id?: Types.ObjectId;
    host?: string;
}

interface GetProps extends CheckProps {
    mustCheck?: boolean;
};

const check = async ({
    token,
    treeId,
    id
}: CheckProps) => {
    const user = await nullableInput(token, userByToken);
    const phTree = await PhTreeClass.findById(treeId);
    if(!phTree) throw new Error("Ph. Tree not found");
    if(!phTree.isPublic && phTree.userId.toString() !== user?._id.toString() && !phTree.collaborators?.map(c => c.toString())?.includes(user?._id.toString() ?? "")) throw new Error("Access denied to the Ph. Tree");
    if(!id) return {
        user,
        phTree
    }
    const species = await SpeciesClass.findById(id);
    if(!species) throw new Error("Species not found");
    if(species.treeId.toString() !== phTree._id.toString()) throw new Error(`${species.name} isn't a ${phTree.name}'s Species`);
    return {
        user,
        phTree,
        species
    };
};

const getSpecies = async ({
    token,
    treeId,
    id,
    mustCheck = true,
    host
}: GetProps): Promise<SpeciesMongo> => {
    const { species } = mustCheck ? await check({ token, treeId, id }) : { species: await SpeciesClass.findById(id)};
    if(!species) throw new Error("Species not found");
    const descendants0 = await Promise.all(
        (
            await SpeciesClass
            .find({
                $expr: {
                    $eq: [
                        { $toString: "$ancestorId" },
                        species._id.toString()
                    ]
                }
            }))
            .map(d => getSpecies({
                token,
                treeId,
                id: d._id,
                mustCheck: false
            })
        )
    );
    const descendants = descendants0.length > 0 ? descendants0 : undefined;
    return {
        id: species._id,
        treeId,
        ancestorId: species.ancestorId ?? undefined,
        descendants,
        name: species.name,
        apparition: species.apparition ?? undefined,
        afterApparition: species.afterApparition ?? undefined,
        duration: species.duration ?? undefined,
        description: species.description ?? undefined,
        image: photoToString(species.image ?? null, host ?? "")
    };
};

class IdSpecies extends Species{
    id: Types.ObjectId;
    descendants: IdSpecies[] = [];
    ancestor?: IdSpecies;
    constructor(json: SpeciesMongo, ancestor?: IdSpecies){
        super(
            json.name,
            json.apparition ?? (ancestor?.apparition ?? 0) + (json.afterApparition ?? 0),
            json.duration,
            ancestor,
            json.descendants?.map(d => new IdSpecies(d, this)),
            json.description,
            json.image
        );
        this.name = json.name;
        this.id = json.id;
    }
    allDescendants(): IdSpecies[] {
        if(!this.descendants || this.descendants.length === 0) return [this];
        return [this, ...this.descendants.flatMap(d => d.allDescendants())];
    }
}

const spApparition = async (id: Types.ObjectId): Promise<number> => {
    let species = await SpeciesClass.findById(id);
    if(!species) return 0;
    return (species.afterApparition ?? species.apparition ?? 0) + ((await nullableInput(species.ancestorId, spApparition)) ?? 0);
}

export const speciesModel: SpeciesModel = {
    createSpecies: async ({
        token,
        treeId,
        name,
        ancestorId,
        apparition,
        afterApparition,
        duration,
        description,
        descendants,
        key
    }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const { phTree } = await check({token, treeId});
        const species = new SpeciesClass({
            ancestorId,
            treeId,
            name,
            apparition: !ancestorId ? apparition : undefined,
            afterApparition: ancestorId ?
                await nullableInput(
                    afterApparition,
                    async (aa) => Math.max(...nullableInput((await SpeciesClass.findById(ancestorId))?.duration, ad => [ad, aa]) ?? [aa], 0)
                ) : undefined,
            duration: Math.max(duration ?? 0, 0),
            description
        });
        const newSpecies = await species.save();
        if(!newSpecies.treeId) throw new Error("Ph. Tree not found");
        phTree.updatedAt = new Date();
        await phTree.save();
        return {
            id: newSpecies._id,
            treeId: newSpecies.treeId,
            ancestorId: newSpecies.ancestorId ?? undefined,
            name: newSpecies.name,
            apparition: newSpecies.apparition ?? undefined,
            afterApparition: newSpecies.afterApparition ?? undefined,
            duration: newSpecies.duration,
            description: newSpecies.description ?? undefined,
            descendants: (await nullableInput(descendants, d => Promise.all(d?.map(desc => speciesModel.createSpecies({ treeId, token, ...desc, ancestorId: newSpecies._id, key })))))?.filter(d => d !== undefined)
        }
    },
    updateSpecies: async ({
        token,
        treeId,
        id,
        name,
        ancestorId,
        apparition,
        afterApparition,
        duration,
        description,
        descendants,
        key,
        host
    }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const {
            phTree,
            species
        } = await check({token, treeId, id });
        if(!species) return undefined;
        if(name) species.name = name;
        if(duration) species.duration = duration;
        if(description) species.description = description !== "" ? description : undefined;
        if(ancestorId){
            const newAncestor = await SpeciesClass.findById(ancestorId);
            if(species.apparition !== undefined && species.apparition !== null && (newAncestor?.apparition || newAncestor?.apparition === 0) && !afterApparition && afterApparition !== 0){
                species.afterApparition = Math.max(species.apparition - newAncestor.apparition, 0);
                species.apparition = undefined;
            }
            if(newAncestor) {
                species.ancestorId = ancestorId;
                if(afterApparition) species.afterApparition = Math.max(afterApparition, 0);
                species.apparition = undefined;
            }
        } else if(ancestorId === null){
            const oldAncestor = await SpeciesClass.findById(species.ancestorId);
            if(apparition !== undefined || oldAncestor) {
                species.ancestorId = undefined;
                species.afterApparition = undefined;
            }
            if(apparition !== undefined) species.apparition = apparition;
            else if(oldAncestor) species.apparition = await spApparition(id);
        } else {
            const oldAncestor = await SpeciesClass.findById(species.ancestorId);
            if(oldAncestor && afterApparition !== undefined) species.afterApparition = Math.max(afterApparition, 0);
            else if(!oldAncestor && apparition !== undefined) species.apparition = apparition
        }
        if(descendants) {
            await Promise.all((await SpeciesClass.find({ ancestorId: id })).map(s => speciesModel.deleteSpecies({ token, treeId, id: s._id, key })));
            await Promise.all(descendants.map(d => speciesModel.createSpecies({ token, treeId, ancestorId: id, ...d, key })));
        }
        await species.save()
        phTree.updatedAt = new Date();
        await phTree.save();
        return await getSpecies({ token, treeId, id, mustCheck: false, host });
    },
    deleteSpecies: async ({ token, treeId, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const { phTree } = await check({ token, treeId, id });
        const json = await getSpecies({ token, treeId, id, mustCheck: false });
        if(!json) return;
        const _id = new IdSpecies(json).allDescendants().map(sp => sp.id);
        await SpeciesClass.deleteMany({ _id: { $in: _id } });
        phTree.updatedAt = new Date();
        await phTree.save();
    },
    setSpeciesImage: async ({ token, treeId, id, image, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const {
            phTree,
            species
        } = await check({token, treeId, id });
        if(!species) return undefined;
        species.image = (await imageModel.createImage({ token, file: image }))?.url;
        await species.save();
        phTree.updatedAt = new Date();
        await phTree.save();
        return await getSpecies({ token, treeId, id, mustCheck: false, host });
    },
    deleteSpeciesImage: async ({ token, treeId, id, key, host }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const {
            phTree,
            species
        } = await check({token, treeId, id });
        if(!species) return;
        await imageModel.deleteImage({token, img: species.image ?? ""});
        species.image = undefined;
        phTree.updatedAt = new Date();
        await phTree.save();
        await species.save();
        return await getSpecies({ token, treeId, id, mustCheck: false, host });
    },
    getSpecies: async ({ token, treeId, id, host }) => {
        return await getSpecies({ token, treeId, id, host });
    },
    getPhTreeSpecies: async ({ token, treeId, host }) => {
        await check({ token, treeId });
        return await Promise.all((
            await SpeciesClass.find({
                $expr: {
                    $eq: [
                        { $toString: "$treeId" },
                        treeId.toString()
                    ]
                },
                $or: [
                    { ancestorId: null },
                    { ancestorId: { $exists: false } }
                ]
            })
        ).map(s => getSpecies({
            token,
            treeId,
            id: s._id,
            mustCheck: false,
            host
        })));
    }
};