import { Router } from "express";

type METHODS = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface AllowedMethodsProps {
    router: Router;
    route?: string;
    methods?: METHODS[];
}

export const allowedMethods = ({
    router,
    route = "/",
    methods = ["GET", "POST", "PATCH", "DELETE"]
}: AllowedMethodsProps) => router.options(route, (_, res) => {
    res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
    res.send(200);
});