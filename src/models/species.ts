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
    if(!phTree.isPublic &&
        (phTree.userId.prototype !== user?._id ||
            !phTree.collaborators?.map(c => c.prototype).includes(user?._id)
        )
    ) throw new Error("Access denied to the Ph. Tree");
    if(!id) return {
        user,
        phTree
    }
    const species = await SpeciesClass.findById(id);
    if(!species) throw new Error("Species not found");
    if(species.treeId.prototype !== phTree._id) throw new Error(`${species.name} isn't a ${phTree.name}'s Species`);
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
    mustCheck = true
}: GetProps): Promise<SpeciesMongo> => {
    const { species } = mustCheck ? await check({ token, treeId, id }) : { species: await SpeciesClass.findById(id)};
    if(!species) throw new Error("Species not found");
    const descendants = await Promise.all(
        (
            await SpeciesClass
            .find({ ancestorId: species._id }))
            .map(d => getSpecies({
                token,
                treeId,
                id: d._id,
                mustCheck: false
            })
        )
    );
    return {
        id: species._id,
        treeId,
        descendants,
        name: species.name,
        apparition: species.apparition ?? undefined,
        afterApparition: species.afterApparition ?? undefined,
        duration: species.duration ?? undefined,
        description: species.description ?? undefined,
        image: photoToString(species.image)
    };
};

class IdSpecies extends Species{
    id: Types.ObjectId = new Types.ObjectId("");
    descendants: IdSpecies[] = [];
    ancestor?: IdSpecies;
    constructor(json: SpeciesMongo, ancestor?: IdSpecies){
        super(
            json.name,
            json.apparition,
            json.duration,
            ancestor,
            json.descendants?.map(d => new IdSpecies(d, this)),
            json.description,
            json.image
        );
        this.id = json.id;
    }
}

const spApparition = async (id: Types.ObjectId): Promise<number> => {
    let species = await SpeciesClass.findById(id);
    if(!species) return 0;
    return (species.afterApparition ?? species.apparition ?? 0) + ((await nullableInput(species.ancestorId?.prototype, spApparition)) ?? 0);
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
            duration: Math.max(duration, 0),
            description
        });
        const newSpecies = await species.save();
        if(!newSpecies.treeId.prototype) throw new Error("Ph. Tree not found");
        phTree.updatedAt = new Date();
        await phTree.save();
        return {
            id: newSpecies._id,
            treeId: newSpecies.treeId.prototype,
            name: newSpecies.name,
            apparition: newSpecies.apparition ?? undefined,
            afterApparition: newSpecies.afterApparition ?? undefined,
            duration: newSpecies.duration,
            description: newSpecies.description ?? undefined,
            descendants: (await nullableInput(descendants, d => Promise.all(d?.map(desc => speciesModel.createSpecies({ treeId, token, ...desc })))))?.filter(d => d !== undefined)
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
        key
    }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const {
            phTree,
            species
        } = await check({token, treeId, id });
        if(!species) return undefined;
        if(name) species.name = name;
        if(duration) species.duration = Math.max(Math.min(...await Promise.all((await SpeciesClass.find({ ancestorId: id })).map(d => d.afterApparition ?? Number.MAX_SAFE_INTEGER)), duration), 0);
        if(description) species.description = description !== "" ? description : undefined;
        if(ancestorId){
            const newAncestor = await SpeciesClass.findById(ancestorId);
            if((species.apparition || species.apparition === 0) && (newAncestor?.apparition || newAncestor?.apparition === 0) && !afterApparition && afterApparition !== 0){
                species.afterApparition = Math.max(species.apparition - newAncestor.apparition, 0);
                species.apparition = undefined;
            }
            if(newAncestor) {
                const { prototype, ...restOfId } = species.ancestorId ?? {};
                species.ancestorId = { prototype: ancestorId, ...restOfId };
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
            await Promise.all((await SpeciesClass.find({ ancestorId: id })).map(s => speciesModel.deleteSpecies({ token, treeId, id: s._id })));
            await Promise.all(descendants.map(d => speciesModel.createSpecies({ token, treeId, ancestorId: id, ...d })));
        }
        await species.save()
        phTree.updatedAt = new Date();
        await phTree.save();
        return await getSpecies({ token, treeId, id, mustCheck: false });
    },
    deleteSpecies: async ({ token, treeId, id, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return;
        const { phTree } = await check({ token, treeId, id });
        const json = await getSpecies({ token, treeId, id, mustCheck: false });
        if(!json) return;
        const _id = new IdSpecies(json).allDescendants(false).map(sp => (sp as IdSpecies).id);
        await SpeciesClass.deleteMany({ _id });
        phTree.updatedAt = new Date();
        await phTree.save();
    },
    setSpeciesImage: async ({ token, treeId, id, image, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        const {
            phTree,
            species
        } = await check({token, treeId, id });
        if(!species) return undefined;
        species.image = (await imageModel.createImage({ token, file: image }))?.url;
        phTree.updatedAt = new Date();
        await phTree.save();
        return await getSpecies({ token, treeId, id, mustCheck: false });
    },
    deleteSpeciesImage: async ({ token, treeId, id, key }) => {
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
        return await getSpecies({ token, treeId, id, mustCheck: false });
    },
    getSpecies: async ({ token, treeId, id }) => {
        return await getSpecies({ token, treeId, id });
    },
    getPhTreeSpecies: async ({ token, treeId }) => {
        await check({ token, treeId });
        return await Promise.all((await SpeciesClass.find({
            treeId,
            $or: [
                { ancestorId: null },
                { ancestorId: { $exists: false } }
            ]
        })).map(s => getSpecies({ token, treeId, id: s._id, mustCheck: false })));
    }
};