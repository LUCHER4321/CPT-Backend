import { Request, Response } from "express";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { Billing, NotiFunc, Order, Plan, Role, TreeCriteria } from "./enums";
import { SpeciesJSON } from "chrono-phylo-tree";
import { StringValue } from "ms";

export type Email = `${string}@${string}.${string}`;

type ControllerFunction = (req: Request, res: Response) => Promise;

type ModelFunction<DATA, OUTPUT> = (data: DATA & {
    key?: Types.ObjectId;
    host?: string;
}) => Promise<OUTPUT | undefined>;

export interface ImageController {
    getImage: ControllerFunction;
}

export interface ImageModel {
    getImage: ModelFunction<{
        img: string;
    }, { path: string }>;
    createImage: ModelFunction<{
        token: string;
        file: Express.Multer.File;
    }, { url: string }>;
    deleteImage: ModelFunction<{
        token: string;
        img: string;
    }, void>;
}

export interface User {
    id: Types.ObjectId;
    email: Email;
    username: string;
    photo?: string;
    role: Role;
    plan: Plan;
    billing?: Billing;
    createdAt: Date;
    lastLogin: Date;
    isActive?: boolean;
    description?: string;
    apiKeys?: Types.ObjectId[];
}

export interface UserController {
    register: ControllerFunction;
    login: ControllerFunction;
    logout: ControllerFunction;
    getUser: ControllerFunction;
    search: ControllerFunction;
    recover: ControllerFunction;
    resetPassword: ControllerFunction;
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
    register: ModelFunction<{
        email: Email;
        password: string;
        username: string;
    }, User & { token: string }>;
    login: ModelFunction<{
        email: Email;
        password: string;
    }, User & { token: string }>;
    logout: ModelFunction<{
        token: string;
    }, void>
    getUser: ModelFunction<{
        id: Types.ObjectId;
    }, User>;
    search: ModelFunction<{
        limit?: number;
        search?: string;
    }, User[]>;
    recover: ModelFunction<{
        email: Email;
        url: string;
    }, string>;
    resetPassword: ModelFunction<{
        token: string;
        email: Email;
        password: string;
    }, User>,
    getMe: ModelFunction<{
        token: string;
    }, User>;
    generateToken: ModelFunction<{
        oldToken: string;
        expiresIn?: number | StringValue;
    }, { token: string}>;
    updateMe: ModelFunction<{
        token: string;
        username?: string;
        plan?: Plan;
        billing?: Billing | null;
        description?: string;
        oldPassword?: string;
        password?: string;
        planExpiration?: Date;
    }, User>;
    deleteMe: ModelFunction<{
        token: string;
    }, void>;
    photoMe: ModelFunction<{
        photo: Express.Multer.File;
        token: string;
    }, User>;
    deletePhotoMe: ModelFunction<{
        token: string;
    }, User>;
    makeAdmin: ModelFunction<{
        token: string;
        adminId: Types.ObjectId;
        removeAdmin?: boolean
    }, User>;
    generateKey: ModelFunction<{
        token: string;
    }, Types.ObjectId>;
    deleteKey: ModelFunction<{
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
    followUser: ModelFunction<{
        token: string;
        followedUserId: Types.ObjectId;
    }, Follow>;
    unfollowUser: ModelFunction<{
        token: string;
        followedUserId: Types.ObjectId;
    }, void>;
    getFollowers: ModelFunction<{
        userId: Types.ObjectId;
    }, User[]>;
    getFollowing: ModelFunction<{
        userId: Types.ObjectId;
    }, User[]>;
    getFollowersCount: ModelFunction<{
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
    setChange: WSControllerFunction;
    createPhTree: ControllerFunction;
    getMyPhTrees: ControllerFunction;
    getMyTotalTrees: ControllerFunction;
    getTotalTrees: ControllerFunction;
    updatePhTree: ControllerFunction;
    deletePhTree: ControllerFunction;
    setPhTreeImage: ControllerFunction;
    deletePhTreeImage: ControllerFunction;
    getPhTrees: ControllerFunction;
    getPhTree: ControllerFunction;
    setView: ControllerFunction;
}

export type TreeSearch = Partial<{
    page: number;
    limit: number;
    search: string;
    userId: Types.ObjectId;
    criteria: TreeCriteria;
    order: Order;
    from: Date;
    to: Date;
}>;

export interface PhTreeChange {
    id: string;
    userId: string;
    name: string;
    image?: string;
    description?: string;
    isPublic: boolean;
    tags?: string[];
    collaborators?: string[];
}

interface SpeciesMongoInput extends Omit<
    Omit<
        Omit<
            Omit<
                SpeciesMongo, "id"
            >, "treeId"
        >, "descendants"
    >, "ancestorId"
> {
    id: string;
    treeId: string;
    ancestorId?: string;
    descendants?: SpeciesMongoInput[];
}

type SearchResult = {
    trees: PhTree[];
    count: number;
}

export interface PhTreeModel {
    createPhTree: ModelFunction<{
        token: string;
        name: string;
        description?: string;
        isPublic?: boolean;
        tags?: string[];
        collaborators?: Types.ObjectId[];
    }, PhTree>;
    getMyPhTrees: ModelFunction<{
        token: string;
        owner?: boolean;
    } & TreeSearch, SearchResult>;
    getMyTotalTrees: ModelFunction<{
        token: string;
    }, {
        total: number;
        myTrees: number;
        collabs: number;
    }>;
    getTotalTrees: ModelFunction<{
        token?: string;
        userId: Types.ObjectId;
    }, {
        total: number;
        myTrees: number;
        collabs: number;
    }>;
    updatePhTree: ModelFunction<{
        token: string;
        id: Types.ObjectId;
        name?: string;
        description?: string;
        isPublic?: boolean;
        tags?: string[];
        newCollaborators?: Types.ObjectId[];
        deleteCollaborators?: Types.ObjectId[];
    }, PhTree>;
    deletePhTree: ModelFunction<{
        token: string;
        id: Types.ObjectId;
    }, void>;
    setPhTreeImage: ModelFunction<{
        id: Types.ObjectId;
        token: string;
        image: Express.Multer.File;
    }, PhTree>;
    deletePhTreeImage: ModelFunction<{
        token: string;
        id: Types.ObjectId;
    }, PhTree>;
    getPhTrees: ModelFunction<{
        token?: string;
    } & TreeSearch, SearchResult>;
    getPhTree: ModelFunction<{
        token?: string;
        id: Types.ObjectId;
    }, PhTree>;
    setView: ModelFunction<{
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
    parentId?: Types.ObjectId;
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
    createComment: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        content: string;
        parentId?: Types.ObjectId;
    }, Comment>;
    updateComment: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        content: string;
    }, Comment>;
    deleteComment: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, void>;
    getComments: ModelFunction<{
        treeId: Types.ObjectId;
    }, Comment[]>;
    getComment: ModelFunction<{
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
    likePhTree: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
    }, Like>;
    unlikePhTree: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
    }, void>;
    likedPhTrees: ModelFunction<{
        token: string;
    }, PhTree[]>;
    phTreeLikes: ModelFunction<{
        token?: string;
        treeId: Types.ObjectId;
    }, {
        likesCount: number;
        myLike?: boolean;
    }>;
    likeComment: ModelFunction<{
        token: string;
        commentId: Types.ObjectId;
    }, Like>;
    unlikeComment: ModelFunction<{
        token: string;
        commentId: Types.ObjectId;
    }, void>;
    likedComments: ModelFunction<{
        token: string;
    }, Comment[]>;
    commentLikes: ModelFunction<{
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
    ancestorId?: Types.ObjectId;
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

export interface SpeciesModel {
    createSpecies: ModelFunction<SpeciesJSON & {
        treeId: Types.ObjectId;
        token: string;
        ancestorId?: Types.ObjectId;
    }, SpeciesMongo>;
    updateSpecies: ModelFunction<Omit<Partial<SpeciesJSON>, "id"> & {
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        ancestorId?: Types.ObjectId | null;
    }, SpeciesMongo>;
    deleteSpecies: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, void>;
    setSpeciesImage: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
        image: Express.Multer.File;
    }, SpeciesMongo>;
    deleteSpeciesImage: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, SpeciesMongo>;
    getSpecies: ModelFunction<{
        token?: string;
        treeId: Types.ObjectId;
        id: Types.ObjectId;
    }, SpeciesMongo>;
    getPhTreeSpecies: ModelFunction<{
        token?: string;
        treeId: Types.ObjectId;
    }, SpeciesMongo[]>;
}

export interface Notification {
    id: string;
    fun: NotiFunc;
    usersId: string[];
    inputs: string[];
    authorId: string;
    seen: boolean;
    createdAt: Date;
    userId?: Types.ObjectId;
    treeId?: Types.ObjectId;
    commentId?: Types.ObjectId;
}

type WSControllerFunction = ModelFunction<{
    socket: Socket;
    call: string;
    key: any;
}, any>;

export interface NotificationController {
    setNotification: WSControllerFunction;
    getNotifications: ControllerFunction;
    seeNotification: ControllerFunction;
}

export interface NotificationModel {
    newFollower: ModelFunction<{
        token: string;
        userId: Types.ObjectId;
    }, Notification>;
    newTree: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
    }, Notification>;
    newComment: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        commentId: Types.ObjectId;
    }, Notification>;
    newLike: ModelFunction<{
        token: string;
        treeId?: Types.ObjectId;
        commentId?: Types.ObjectId;
    }, Notification>;
    newCollaborate: ModelFunction<{
        token: string;
        treeId: Types.ObjectId;
        userId: Types.ObjectId;
    }, Notification>;
    getNotifications: ModelFunction<{
        token: string;
        from?: Date;
        to?: Date;
        limit?: number;
    }, Notification[]>;
    seeNotification: ModelFunction<{
        token: string;
        id: Types.ObjectId;
    }, Notification>
}

export interface ContactController {
    contact: ControllerFunction;
}

export interface ContactModel {
    contact: ModelFunction<{
        name: string;
        email: string;
        message: string;
    }, {}>;
}