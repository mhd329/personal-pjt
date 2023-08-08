import { createClient } from "redis";
import env from "dotenv";
env.config();

// 레디스 클라이언트 연결
const redisClient = createClient({
    url: process.env.DEBUG === "true" ? "redis://localhost:6379" : "redis://redis:6379"
});

export default redisClient;