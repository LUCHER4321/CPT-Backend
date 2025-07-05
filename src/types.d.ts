import { Request, Response } from "express";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { NotiFunc, Order, Plan, Role, TreeCriteria } from "./enums";
import { SpeciesJSON } from "chrono-phylo-tree";
import { StringValue } from "ms";

type ControllerFunction = (req: Request, res: Response) => Promise;

type ModelFuncton<DATA, OUTPUT> = (data: DATA & { key?: Types.ObjectId }) => Promise<OUTPUT | undefined>;

export interface ImageController {
    getImage: ControllerFunction;
}

export interface ImageModel {
    getImage: ModelFuncton<{
        img: string;
    }, { path: string }>;
    createImage: ModelFuncton<{
        token: string;
        file: Express.Multer.File;
    }, { url: string }>;
    deleteImage: ModelFuncton<{
        token: string;
        img: string;
    }, void>;
}

export interface User {
    id: Types.ObjectId;
    email: string;
    username: string;
    photo?: string;
    role: Role;
    plan: Plan;
    createdAt: Date;
    lastLogin: Date;
    isActive?: boolean;
    apiKeys?: Types.ObjectId[];
}

export interface UserController {
    register: ControllerFunction;
    login: ControllerFunction;
    logout: ControllerFunction;
    getUser: ControllerFunction;
    search: ControllerFunction;
    getMe: ControllerFunction;
    generateToken: ControllerFunction;
    updateMe: ControllerFunction;
    deleteMe: ControllerFunction;
    photoMe: ControllerFunction;
    deletePhotoMe: ControllerFunction;
    makeAdmin: ControllerFunction;
    generateKey: ControllerFunction;
    deleteKey: ControllerFunction;
}

export interface UserModel {
    register: ModelFuncton<{
        email: string;
        password: string;
        username: string;
    }, User & { token: string }>;
    login: ModelFuncton<{
        email: string;
        password: string;
    }, User & { token: string }>;
    logout: ModelFuncton<{
        token: string;
    }, void>
    getUser: ModelFuncton<{
        id: Types.ObjectId;
    }, User>;
    search: ModelFuncton<{
        limit?: number;
        search?: string;
    }, User[]>
    getMe: ModelFuncton<{
        token: string;
    }, User>;
    generateToken: ModelFuncton<{
        oldToken: string;
        expiresIn?: number | StringValue;
    }, { token: string}>;
    updateMe: ModelFuncton<{
        token: string;
        username?: string;
        plan?: Plan;
        oldPassword?: string;
        password?: string;
    }, User>;
    deleteMe: ModelFuncton<{
        token: string;
    }, void>;
    photoMe: ModelFuncton<{
        photo: Express.Multer.File;
        token: string;
    }, User>;
    deletePhotoMe: ModelFuncton<{
        token: string;
    }, User>;
    makeAdmin: ModelFuncton<{
        token: string;
        adminId: Types.ObjectId;
        removeAdmin?: boolean
    }, User>;
    generateKey: ModelFuncton<{
        token: string;
    }, Types.ObjectId>;
    deleteKey: ModelFuncton<{
        token: string;
        keyToDelete: Types.ObjectId;
    }, void>;
}

export interface Follow {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    followedUserId: Types.ObjectId;
}

export interface FollowController {
    followUser: ControllerFunction;
    unfollowUser: ControllerFunction;
    getFollowers: ControllerFunction;
    getFollowing: ControllerFunction;
    getFollowersCount: ControllerFunction;
}

export interface FollowModel {
    followUser: ModelFuncton<{
        token: string;
        followedUserId: Types.ObjectId;
    }, Follow>;
    unfollowUser: ModelFuncton<{
        token: string;
        followedUserId: Types.ObjectId;
    }, void>;
    getFollowers: ModelFuncton<{
        userId: Types.ObjectId;
    }, User[]>;
    getFollowing: ModelFuncton<{
        userId: Types.ObjectId;
    }, User[]>;
    getFollowersCount: ModelFuncton<{
        userId: Types.ObjectId;
    }, number>;
}

export interface PhTree {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    image?: string;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    collaborators?: Types.ObjectId[];
    likes: number;
    comments: number;
    views: number;
}

export interface PhTreeController {
    createPhTree: ControllerFunction;
    getMyPhTrees: ControllerFunction;
    updatePhTree: ControllerFunction;
    deletePhTree: ControllerFunction;
    setPhTreeImage: ControllerFunction;
    deletePhTreeImage: ControllerFunction;
    getPhTrees: ControllerFunction;
    getPhTree: ControllerFunction;
    setView: ControllerFunction;
}

type TreeSearch = Partial<{
    page: number;
    limit: number;
    search: string;
    criteria: TreeCriteria;
    order: Order;
    from: Date;
    to: Date;
}>;

export interface PhTreeModel {
    createPhTree: ModelFuncton<{
        token: string;
        name: string;
        description?: string;
        isPublic?: boolean;
        tags?: string[];
        collaborators?: Types.ObjectId[];
    }, PhTree>;
    getMyPhTrees: ModelFuncton<{
        token: string;
    } & TreeSearch, PhTree[]>;
    updatePhTree: ModelFuncton<{
        token: string;
        id: Types.ObjectId;
        name?: string;
        description?: string;
        isPublic?: boolean;
        tags?: string[];
        newCollaborators?: Types.ObjectId[];
        deleteCollaborators?: Types.ObjectId[];
    }, PhTree>;
    deletePhTree: ModelFuncton<{
        token: string;
        id: Types.ObjectId;
    }, void>;
    setPhTreeImage: ModelFuncton<{
        id: Types.ObjectId;
        token: string;
        image: Express.Multer.File;
    }, PhTree>;
    deletePhTreeImage: ModelFuncton<{
        token: string;
        id: Types.ObjectId;
    }, PhTree>;
    getPhTrees: ModelFuncton<{
        token?: string;
    } & TreeSearch, PhTree[]>;
    getPhTree: ModelFuncton<{
        token?: string;
        id: Types.ObjectId;
    }, PhTree>;
    setView: ModelFuncton<{
        token?: string;
        id: Types.ObjectId;
    }, number>
}

export interface Comment {
    id: Types.ObjectId;
    treeId: Types.ObjectId;
    userId?: Types.ObjectId;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    replies?: Comment[];
}

export interface CommentController {
    createComment: ControllerFunction;
    deleteComment: ControllerFunction;
    updateComment: ControllerFunction;
    getComments: ControllerFunction;
    getComment: ControllerFunction;
}

export interface CommentModel {
    createComment: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        content: string;
        parentId?: Types.ObjectId;
    }, Comment>;
    updateComment: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        content: string;
    }, Comment>;
    deleteComment: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, void>;
    getComments: ModelFuncton<{
        treeId: Types.ObjectId;
    }, Comment[]>;
    getComment: ModelFuncton<{
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, Comment>;
}

export interface Like {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    treeId?: Types.ObjectId;
    commentId?: Types.ObjectId;
    createdAt: Date;
}

export interface LikeController {
    likePhTree: ControllerFunction;
    unlikePhTree: ControllerFunction;
    likedPhTrees: ControllerFunction;
    phTreeLikes: ControllerFunction;
    likeComment: ControllerFunction;
    unlikeComment: ControllerFunction;
    likedComments: ControllerFunction;
    commentLikes: ControllerFunction;
}

export interface LikeModel {
    likePhTree: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
    }, Like>;
    unlikePhTree: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
    }, void>;
    likedPhTrees: ModelFuncton<{
        token: string;
    }, PhTree[]>;
    phTreeLikes: ModelFuncton<{
        token?: string;
        treeId: Types.ObjectId;
    }, {
        likesCount: number;
        myLike?: boolean;
    }>;
    likeComment: ModelFuncton<{
        token: string;
        commentId: Types.ObjectId;
    }, Like>;
    unlikeComment: ModelFuncton<{
        token: string;
        commentId: Types.ObjectId;
    }, void>;
    likedComments: ModelFuncton<{
        token: string;
    }, Comment[]>;
    commentLikes: ModelFuncton<{
        token?: string;
        commentId: Types.ObjectId;
    }, {
        likesCount: number;
        myLike?: boolean;
    }>;
}

export interface SpeciesMongo extends Omit<SpeciesJSON, "descendants"> {
    id: Types.ObjectId;
    treeId: Types.ObjectId;
    descendants?: SpeciesMongo[];
}

export interface SpeciesController {
    createSpecies: ControllerFunction;
    updateSpecies: ControllerFunction;
    deleteSpecies: ControllerFunction;
    setSpeciesImage: ControllerFunction;
    deleteSpeciesImage: ControllerFunction;
    getSpecies: ControllerFunction;
    getPhTreeSpecies: ControllerFunction;
}

interface SpeciesInput {
    name: string;
    ancestorId?: Types.ObjectId;
    apparition?: number;
    afterApparition?: number;
    duration: number;
    description?: string;
    descendants?: Omit<SpeciesInput, "ancestorId">[];
}

export interface SpeciesModel {
    createSpecies: ModelFuncton<SpeciesInput & {
        treeId: Types.ObjectId;
        token: string;
    }, SpeciesMongo>;
    updateSpecies: ModelFuncton<Partial<Omit<SpeciesInput, "ancestorId">> & {
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        ancestorId?: Types.ObjectId | null;
    }, SpeciesMongo>;
    deleteSpecies: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, void>;
    setSpeciesImage: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        image: Express.Multer.File;
    }, SpeciesMongo>;
    deleteSpeciesImage: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, SpeciesMongo>;
    getSpecies: ModelFuncton<{
        token?: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, SpeciesMongo>;
    getPhTreeSpecies: ModelFuncton<{
        token?: string;
        treeId: Types.ObjectId;
    }, SpeciesMongo[]>;
}

export interface Notification {
    id: Types.ObjectId;
    fun: NotiFunc;
    usersId: Types.ObjectId[];
    inputs: string[];
    authorId: Types.ObjectId;
    seen: boolean;
    createdAt: Date;
}

type WSControllerFunction = ModelFuncton<{
    socket: Socket;
    call: string;
}, any>;

export interface NotificationController {
    setNotification: WSControllerFunction;
    getNotifications: ControllerFunction;
    seeNotification: ControllerFunction;
}

export interface NotificationModel {
    newFollower: ModelFuncton<{
        token: string;
        userId: Types.ObjectId;
    }, Notification>;
    newTree: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
    }, Notification>;
    newComment: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        commentId: Types.ObjectId;
    }, Notification>;
    newLike: ModelFuncton<{
        token: string;
        treeId?: Types.ObjectId;
        commentId?: Types.ObjectId;
    }, Notification>;
    newCollaborate: ModelFuncton<{
        token: string;
        treeId: Types.ObjectId;
        userId: Types.ObjectId;
    }, Notification>;
    getNotifications: ModelFuncton<{
        token: string;
        from?: Date;
        to?: Date;
        limit?: number;
    }, Notification[]>;
    seeNotification: ModelFuncton<{
        token: string;
        id: Types.ObjectId;
    }, Notification>
}