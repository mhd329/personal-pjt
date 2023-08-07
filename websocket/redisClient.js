import { createClient } from "redis";

// 레디스 클라이언트 연결
const redisClient = createClient({
    // url: "redis://localhost:6379",
    url: "redis://redis:6379",
});

export default redisClient;