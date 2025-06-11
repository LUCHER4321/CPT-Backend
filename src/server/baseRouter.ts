import { commentController } from "../controllers/comment";
import { followController } from "../controllers/follow";
import { imageController } from "../controllers/image";
import { likeController } from "../controllers/like";
import { phTreeController } from "../controllers/phTree";
import { speciesController } from "../controllers/species";
import { userController } from "../controllers/user";
import { commentModel } from "../models/comment";
import { followModel } from "../models/follow";
import { imageModel } from "../models/image";
import { likeModel } from "../models/like";
import { phTreeModel } from "../models/phTree";
import { speciesModel } from "../models/species";
import { userModel } from "../models/user";
import { createBaseRoutes } from "../routes/base";
import { createCommentRoutes } from "../routes/comment";
import { createFollowRoutes } from "../routes/follow";
import { createImageRoutes } from "../routes/image";
import { createLikeRoutes } from "../routes/like";
import { createPhTreeRoutes } from "../routes/phTree";
import { createSpeciesRoutes } from "../routes/species";
import { createUserRoutes } from "../routes/user";

export const baseRouter = createBaseRoutes({
    url: "/api/life-tree",
    routes: new Map([
        [
            "/user",
            createUserRoutes({
                userController: userController({
                    userModel: userModel
                })
            })
        ],
        [
            "/follow",
            createFollowRoutes({
                followController: followController({
                    followModel: followModel
                })
            })
        ],
        [
            "/ph-tree",
            createPhTreeRoutes({
                phTreeController: phTreeController({
                    phTreeModel: phTreeModel
                })
            })
        ],
        [
            "/comment",
            createCommentRoutes({
                commentController: commentController({
                    commentModel: commentModel
                })
            })
        ],
        [
            "/like",
            createLikeRoutes({
                likeController: likeController({
                    likeModel: likeModel
                })
            })
        ],
        [
            "/species",
            createSpeciesRoutes({
                speciesController: speciesController({
                    speciesModel: speciesModel
                })
            })
        ],
        [
            "/image",
            createImageRoutes({
                imageController: imageController({
                    imageModel: imageModel
                })
            })
        ],
    ])
});