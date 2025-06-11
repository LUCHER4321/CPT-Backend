import { Router } from "express"

interface BaseRoutesProps {
    url: string;
    routes: Map<string, Router>;
}

export const createBaseRoutes = ({
    url = "/",
    routes = new Map()
}: Partial<BaseRoutesProps>) => {
    const baseRouter = Router();
    for (const [path, router] of routes.entries()) {
        baseRouter.use(path, router);
    }
    return {
        url,
        router: baseRouter,
    };
};