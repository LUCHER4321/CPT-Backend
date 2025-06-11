import { Express, json, Router } from "express"
import morgan from "morgan";
import { corsMw } from "../middlewares/cors";
import cookieParser from "cookie-parser";

interface ServerConfigProps {
    app: Express;
    baseRouter?: {
        url: string;
        router: Router;
    };
}
export default ({
    app,
    baseRouter = {
        url: "/",
        router: Router()
    }
} : ServerConfigProps) => {
    app.use(json());
    app.use(corsMw());
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.use(baseRouter.url, baseRouter.router);
    return app;
};