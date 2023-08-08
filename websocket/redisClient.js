import { createClient } from "redis";
import env from "dotenv";
env.config();

// 레디스 클라이언트 연결
const redisClient = createClient({
    // 레디스 연결을 할 때는 프로토콜을 http://가 아니라 redis://로 해주어야 한다.
    url: process.env.DEBUG === "true" ? "redis://localhost:6379" : `redis://${process.env.REDIS_HOST}`
});

export default redisClient;