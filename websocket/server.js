import { createServer } from "http";
import { Server } from "socket.io";
import redisClient from "./redisClient.js"; // 레디스 클라이언트

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
        // origin: "http://localhost:3000",
        origin: "http://frontend",
        mathods: [
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

    console.log(`연결된 유저: ${socket.id}`); // 연결 확인
    // const nowRequestIp = socket.handshake.address; // 클라이언트의 IP주소 (nginx 사용시 프록시 서버의 ip로 덮어씌워짐)
    const xForwardedFor = socket.handshake.headers['x-forwarded-for']; // 클라이언트의 실제 IP주소
    
    socket.on("fromFront", async (data) => { // 데이터 받아오기

        console.log("웹소켓 서버가 받은 데이터:", data); // 받은 데이터 확인
        const PrevRequestTime = await redisClient.get(xForwardedFor); // 클라이언트가 기존에 요청했던 시간
        // console.log("클라이언트 기존 요청시간:", PrevRequestTime);
        const nowRequestTime = Date.now(); // 클라이언트가 보낸 시간
        // console.log("nowRequestTime - PrevRequestTime", nowRequestTime - PrevRequestTime)

        if (nowRequestTime - PrevRequestTime < requestLimitInterval) { // 시간 내에 요청이 너무 많은 상태

            socket.emit("fromBack", "Too many requests"); // 요청이 너무 많기 때문에 null을 반환한다.

        } else { // 요청할 수 있는 상태

            await redisClient.set(xForwardedFor, nowRequestTime);
            // console.log("클라이언트 새 요청시간:", nowRequestTime);
            socket.emit("fromBack", data); // 브로드캐스팅 수행(발신자 포함)
            // socket.broadcast.emit("fromBack", data); // 브로드캐스팅 수행
            console.log("웹소켓 서버가 전송한 데이터:", data); // 보낸 데이터 확인

            setTimeout(async () => { // 마지막 요청 시간 초기화

                await redisClient.set(xForwardedFor, 0);
                // console.log("클라이언트 요청시간 초기화");

            }, requestLimitInterval);
        }
    });
    socket.on("disconnect", () => {
        console.log(`연결 해제된 유저: ${socket.id}`); // 연결 해제
    });
});