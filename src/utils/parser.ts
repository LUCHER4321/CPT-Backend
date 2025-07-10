import { Types } from "mongoose";
import { NotiFunc, Order, TreeCriteria } from "../enums";
import { nullableInput } from "./nullableInput";
import { Email } from "../types";

const isString = (str: any): boolean => typeof str === "string" || str instanceof String;

const parseProp = <T>(t: any, check: (t: any) => boolean, prop: string): T => {
    if(!check(t)) throw new Error(`Incorrect or missing ${prop}`);
    return t as T;
}

const parseString = (str: any, prop = "") => parseProp<string>(str, isString, prop);

const isURL = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const parseURL = (url: any, prop?: string): string => {
    if(!isString(url) || !isURL(url)) throw new Error(`Incorrect or missing ${prop}`);
    return url;
};

const parseEmail = (str: string) => {
    const validate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    if(validate) return str as Email;
    throw new Error("Invalid Email");
};

const isEnum = (T: any) => (t: any) => Object.values(T).includes(t);

const isBoolean = (bool: any): boolean => typeof bool === "boolean" || bool instanceof Boolean;

const parseBoolean = (bool: any, prop = "") => parseProp<boolean>(bool, isBoolean, prop);

const isList = (ls: any): boolean => Array.isArray(ls);

const parseList = <T,>(ls: any, parse: (el: any, pr: string) => T, prop = "", props: string = "") => parseProp<any[]>(ls, isList, props).map(el => parse(el, prop));

const isNumber = (num: any): boolean => typeof num === "number" || num instanceof Number;

const parseNumber = (num: any, prop = "") => parseProp<number>(num, isNumber, prop);

const parseFun = (fun: any, prop = "") => parseProp<NotiFunc>(fun, isEnum(NotiFunc), prop);

const toPartial = <T,>(object: () => T): (T | undefined) => {
    try {
        return object();
    } catch {
        return undefined;
    }
};

export const getKey = (apiKey: any) => nullableInput(toPartial(() => parseString(apiKey)), toObjectId);

export const toObjectId = (id: string) => new Types.ObjectId(id);

export const parseCriteria = (criteria: any) => toPartial(() => parseProp<TreeCriteria>(criteria, isEnum(TreeCriteria), ""));

export const parseOrder = (order: any) => toPartial(() => parseProp<Order>(order, isEnum(Order), ""));

export const parseRegister = (object: any) => ({
    username: parseString(object.username, "username"),
    ...parseLogin(object)
});

export const parseLogin = (object: any) => ({
    email: parseEmail(parseString(object.email, "email")),
    password: parseString(object.password, "password")
});

export const parseRecover = (object: any) => ({
    email: parseEmail(parseString(object.email, "email")),
    url: parseURL(object.url, "url")
})

export const parsePatchUser = (object: any) => ({
    username: toPartial(() => parseString(object.username)),
    oldPassword: toPartial(() => parseString(object.oldPassword)),
    password: toPartial(() => parseString(object.password))
});

export const parseNewAdmin = (object: any) => ({
    adminId: parseString(object.adminId, "adminId"),
    removeAdmin: toPartial(() => parseBoolean(object.removeAdmin))
})

const treePartials = (object: any) => ({
    description: toPartial(() => parseString(object.description)),
    tags: toPartial(() => parseList<string>(object.tags, parseString)),
});

export const parseNewTree = (object: any) => ({
    name: parseString(object.name, "name"),
    isPublic: parseBoolean(object.isPublic, "isPublic"),
    collaborators: toPartial(() => parseList<string>(object.collaborators, parseString)),
    ...treePartials(object)
});

export const parsePatchTree = (object: any) => ({
    name: toPartial(() => parseString(object.name)),
    isPublic: toPartial(() => parseBoolean(object.isPublic)),
    newCollaborators: toPartial(() => parseList<string>(object.collaborators, parseString)),
    deleteCollaborators: toPartial(() => parseList<string>(object.collaborators, parseString)),
    ...treePartials(object)
});

export const parseNewComment = (object: any) => ({
    content: parseString(object.content, "content"),
    parentId: toPartial(() => parseString(object.parentId))
});

export const parsePatchComment = (object: any) => ({
    content: toPartial(() => parseString(object.content))
});

type SpeciesInput = Partial<{
    apparition: number;
    afterApparition: number;
    description: string;
    descendants: Omit<SpeciesInput, "ancestorId">[];
}> & {
    ancestorId?: string | null;
    name: string;
    duration: number;
};

const speciesPartials = (object: any) => ({
    apparition: toPartial(() => parseNumber(object.apparition)),
    afterApparition: toPartial(() => parseNumber(object.afterApparition)),
    description: toPartial(() => parseString(object.afterApparition)),
    descendants: toPartial(() => object.descendants.map(parseNewSpecies))
})

export const parseNewSpecies = (object: any): SpeciesInput => ({
    name: parseString(object.name, "name"),
    duration: parseNumber(object.duration, "duration"),
    ancestorId: toPartial(() => parseString(object.ancestorId)),
    ...speciesPartials(object)
});

export const parsePatchSpecies = (object: any): Partial<SpeciesInput> => ({
    name: toPartial(() => parseString(object.name)),
    duration: toPartial(() => parseNumber(object.duration)),
    ancestorId: object.ancestorId === null ? null : toPartial(() => parseString(object.ancestorId)),
    ...speciesPartials(object)
});

export const parseNewNotification = (data: any) => ({
    fun: toPartial(() => parseFun(data.fun)),
    userId: toPartial(() => parseString(data.userId)),
    treeId: toPartial(() => parseString(data.treeId)),
    commentId: toPartial(() => parseString(data.commentId))
});