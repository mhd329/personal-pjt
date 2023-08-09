import redisClient from "./redisClient.js"; // 레디스 클라이언트
import { createServer } from "http";
import { Server } from "socket.io";
import env from "dotenv";
env.config();

// 레디스 설정
// 레디스 연결 이벤트 처리
redisClient.on("connect", () => {
    console.log("레디스 연결됨");
});

// 레디스 오류 처리
redisClient.on("error", (error) => {
    console.error("레디스 에러:", error);
});

// 레디스 연결하기
await redisClient.connect();

// 웹소켓 서버 설정
const httpServer = createServer();
const server = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://frontend",],
        methods: [
            "GET",
            "POST",
        ],
    },
});

// 클라이언트의 요청 제한
const requestLimitInterval = 10000; // 10초

// 웹소켓 서버 열기
const PORT = 5001;
httpServer.listen(PORT, () => {
    console.log(`웹소켓 서버가 ${PORT}번 포트에서 시작되었습니다.`);
});

server.on("connection", (socket) => { // 연결
    const socketId = socket.id;

    console.log(`Connected user: ${socketId}`); // 연결 확인

    // 클라이언트의 IP주소
    // nginx 미사용 : nginx 사용
    const userIP = process.env.DEBUG === "true" ? socket.handshake.address : socket.handshake.headers["x-forwarded-for"];
    socket.on("fromFront", async (data) => { // 데이터 받아오기

        console.log("Received data:", data); // 받은 데이터 확인

        // 순차 처리를 위한 큐 통로(작업 대기열) 설정
        // 데이터를 수신한 순간 해시화하고 대기열에 넣는다.
        await redisClient.HSET(`user:${socketId}`, {
            user: data.user,
            pw: data.pw,
            content: data.content,
            socketId: socketId,
            userIP: userIP
        });
        await redisClient.RPUSH(`workflow`, `user:${socketId}`);
        // 대기열에서 하나씩 꺼내오며 순차적으로 실행하여 요청에 대한 응답 순서를 보장한다.
        const userKey = await redisClient.LPOP(`workflow`);

        // console.log("LPOP result:", userKey);

        const uIp = await redisClient.HGET(userKey, `userIP`); // 유저 실제 아이피
        const uId = await redisClient.HGET(userKey, `socketId`); // 유저 소켓 아이디
        const user = await redisClient.HGET(userKey, `user`); // 유저
        const pw = await redisClient.HGET(userKey, `pw`); // 비밀번호
        const content = await redisClient.HGET(userKey, `content`); // 유저가 보낸 데이타
        const PrevRequestTime = await redisClient.GET(uIp) || 0; // 클라이언트가 기존에 요청했던 시간
        const nowRequestTime = Date.now(); // 클라이언트가 보낸 시간

        if (nowRequestTime - PrevRequestTime < requestLimitInterval) { // 시간 내에 요청이 너무 많은 상태
            socket.emit("fromBack", "Too many requests"); // 요청이 너무 많기 때문에 null을 반환한다.
        } else { // 요청할 수 있는 상태
            await redisClient.SET(uIp, nowRequestTime);
            // 브로드캐스팅
            socket.broadcast.emit("fromBack", {
                broadcast: true,
                user: user,
                pw: pw,
                content: content
            });
            socket.emit("fromBack", {
                broadcast: false,
                user: user,
                pw: pw,
                content: content
            });

            console.log("Data transmission:",
                { // 보낸 데이터 확인;
                    user: user,
                    pw: pw,
                    content: content
                });

        }

        socket.on("disconnect", () => {

            console.log(`Disconnected user: ${socketId}`); // 연결 해제

        });
    });
});