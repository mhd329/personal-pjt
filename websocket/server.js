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
    const strUserIP = userIP.toString();
    console.log(strUserIP)
    socket.on("fromFront", async (data) => { // 데이터 받아오기
        
        console.log("Received data:", data); // 받은 데이터 확인

        // 순차 처리를 위한 큐 통로(작업 대기열) 설정
        // 데이터를 수신한 순간 해시화하고 대기열에 넣는다.
        await redisClient.HSET(
            `user:${socketId}`,
            `user`, `${data.user}`,
            `content`, `${data.content}`,
            `socketId`, `${socketId}`,
            `userIP`, `${strUserIP}`
        )
        await redisClient.RPUSH(`workflow`, `user:${socketId}`);
        // 대기열에서 하나씩 꺼내오며 순차적으로 실행하여 요청에 대한 응답 순서를 보장한다.
        const userKey = await redisClient.LPOP(`workflow`);

        console.log("LPOP result:", userKey);

        const uIp = await redisClient.HGET(userKey, `userIP`); // 유저 실제 아이피
        const uId = await redisClient.HGET(userKey, `socketId`); // 유저 소켓 아이디
        const user = await redisClient.HGET(userKey, `user`); // 유저가 보낸 데이타
        const content = await redisClient.HGET(userKey, `content`); // 유저가 보낸 데이타
        console.log(uIp)
        console.log(uId)
        console.log(user)
        console.log(content)
        const PrevRequestTime = await redisClient.GET(uIp) || 0; // 클라이언트가 기존에 요청했던 시간
        const nowRequestTime = Date.now(); // 클라이언트가 보낸 시간

        if (nowRequestTime - PrevRequestTime < requestLimitInterval) { // 시간 내에 요청이 너무 많은 상태
            socket.emit("fromBack", "Too many requests"); // 요청이 너무 많기 때문에 null을 반환한다.
        } else { // 요청할 수 있는 상태
            await redisClient.SET(uIp, nowRequestTime);
            // socket.emit("fromBack", data); // 브로드캐스팅 수행(발신자 포함)
            // 브로드캐스팅을 위한 데이터 가공
            socket.broadcast.emit("fromBack", {
                broadcast: true,
                user: uData.user,
                content: uData.content
            }); // 브로드캐스팅 수행
            // 전송한 유저를 위한 데이터 가공
            server.to(uId).emit("fromBack", {
                broadcast: false,
                user: uData.user,
                content: uData.content
            });

            console.log("Data transmission:", uData); // 보낸 데이터 확인;

        }

        socket.on("disconnect", () => {

            console.log(`Disconnected user: ${socketId}`); // 연결 해제

        });
    });
});
// server.on("connection", (socket) => { // 연결
//     const socketId = socket.id;
//     console.log(`연결된 유저: ${socketId}`); // 연결 확인

//     // const nowRequestIp = socket.handshake.address; // 클라이언트의 IP주소 (nginx 사용시 프록시 서버의 ip로 덮어씌워짐)
//     const userIP = socket.handshake.headers["x-forwarded-for"]; // 클라이언트의 실제 IP주소
//     socket.on("fromFront", async (data) => { // 데이터 받아오기
//         console.log("웹소켓 서버가 받은 데이터:", data); // 받은 데이터 확인
//         // 순차 처리를 위한 큐 통로(작업 대기열) 설정
//         // 데이터를 수신한 순간 해시화하고 대기열에 넣는다.
//         await redisClient.hSet(`user:${userIP}`, `socketId`, `${socketId}`, `data`, `${data}`);
//         await redisClient.rPush("workflow", `user:${userIP}`);

//         // 여기 아래부터는 대기열에서 하나씩 꺼내오며 순차적으로 실행하여 요청에 대한 응답 순서를 보장한다.
//         const userKey = await redisClient.lPop("workflow", (error, result) => {});

//         const PrevRequestTime = await redisClient.get(userIP) || 0; // 클라이언트가 기존에 요청했던 시간
//         // 소켓 아이디는 새로고침하면 바뀌기 때문에 새로고침을 계속 하면서 요청을 연속해서 할 수 있다.

//         const nowRequestTime = Date.now(); // 클라이언트가 보낸 시간
//         if (nowRequestTime - PrevRequestTime < requestLimitInterval) { // 시간 내에 요청이 너무 많은 상태
//             socket.emit("fromBack", "Too many requests"); // 요청이 너무 많기 때문에 null을 반환한다.
//         } else { // 요청할 수 있는 상태
//             await redisClient.set(userIP, nowRequestTime);
//             // socket.emit("fromBack", data); // 브로드캐스팅 수행(발신자 포함)
//             // 브로드캐스팅을 위한 데이터 가공
//             socket.broadcast.emit("fromBack", {
//                 broadcast: true,
//                 user: data.user,
//                 content: data.content
//             }); // 브로드캐스팅 수행
//             // 전송한 유저를 위한 데이터 가공
//             server.to(socketId).emit("fromBack", {
//                 broadcast: false,
//                 user: data.user,
//                 content: data.content
//             });

//             console.log("웹소켓 서버가 전송한 데이터:", data); // 보낸 데이터 확인;
//         }
//     });
//     socket.on("disconnect", () => {
//         console.log(`연결 해제된 유저: ${socketId}`); // 연결 해제
//     });
// });