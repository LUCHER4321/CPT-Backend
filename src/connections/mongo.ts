import mongoose from "mongoose";
import { URL } from "../config";

export const connectMongo = () => mongoose
    .connect(URL)
    .then(() => console.log("Database connected"))
    .catch(e => console.error(e));