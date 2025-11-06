import { connect, connection, disconnect } from "mongoose";
import { MONGO_URL } from "../config";

export const connectMongo = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("Mongo URL:", MONGO_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
        await connect(MONGO_URL, {
            serverApi: {
                version: "1",
                strict: true,
                deprecationErrors: true
            },
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            family: 4
        });
        await connection.db?.admin().command({ ping: 1 });
        console.log("Database connected successfully");
    } catch (e) {
        console.error("Database connection error:", e);
        await disconnect();
    }
}