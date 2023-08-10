import redisClient from "./redisClient.js"; // 레디스 클라이언트
import { createServer } from "http";
import { Server } from "socket.io";
import env from "dotenv";
env.config();

redisClient.on("connect", () => { // 레디스 연결시 이벤트 처리
  console.log("Redis connected");
});

redisClient.on("error", (error) => { // 레디스 오류시 처리
  console.error("Redis Error:", error);
});

await redisClient.connect(); // 레디스 연결하기

const httpServer = createServer(); // 웹소켓 서버 설정
const server = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://frontend",],
    methods: [
      "GET",
      "POST",
    ],
  },
});

const requestLimitInterval = 10000; // 클라이언트의 요청 제한 10초
const PORT = 5001; // 웹소켓 서버 포트

server.on("connection", async (socket) => { // 연결
  const socketID = socket.id; // 소켓 id

  console.log(`Connected user: ${socketID}`); // 연결 확인

  // 클라이언트의 실제 IP주소
  // nginx 미사용 : nginx 사용
  const userIP = process.env.DEBUG === "true" ? socket.handshake.address : socket.handshake.headers["x-forwarded-for"];

  // 유저가 연결된 순간 세션에 유저가 존재하는지 검증을 한다.
  const userExistsInSession = await redisClient.SISMEMBER(`session`, `user:<${userIP}>`);
  if (!userExistsInSession) {
    /*
    유저가 세션에 없다면 세션에 유저 ip를 넣는다.
    세션은 집합을 통해 구현하였다.
    현재 접속중인 사람 수 -> SCARD: 집합의 크기 반환
    유저 들어옴 -> SADD: 집합에 추가(중복 값은 처리되지 않음)
    유저 나감 -> SREM: 집합에서 제거
    */
    await redisClient.SADD(`session`, `user:<${userIP}>`);
    const cnt = await redisClient.SCARD(`session`);
    socket.emit("increase", cnt); // 증가 이벤트 실행
  }
  socket.on("fromFront", async (data) => { // 데이터 받아오기

    console.log("Received data:", data); // 받은 데이터 확인

    // 데이터를 수신한 순간 기존 유저 객체가 존재하는지 검사한다.
    const PrevUserObj = await redisClient.json.GET(`user:<${userIP}>`, `$`) || 0;
    if (PrevUserObj) { // 존재한다면 덮어쓰고 새로 저장한다.
      const updatedUserObj = {
        ...PrevUserObj,
        user: data.user,
        pw: data.pw,
        content: data.content,
        socketID: socketID,
      };
      await redisClient.json.SET(`user:<${userIP}>`, `$`, updatedUserObj);
    } else { // 유저가 없다면 유저 ip로 구분되는 유저 객체를 새로 만들고 db에 넣는다.
      const userObj = {
        user: data.user,
        pw: data.pw,
        content: data.content,
        socketID: socketID,
        userIP: userIP,
      }
      await redisClient.json.SET(`user:<${userIP}>`, `$`, userObj);
    }
    await redisClient.RPUSH(`queue`, `user:<${userIP}>`); // 대기열에 추가
    async function redisResponse() { // 대기열에서 하나씩 꺼내오며 순차적으로 실행하여 요청에 대한 응답 순서를 보장하는 함수
      const userObj = await redisClient.LPOP(`queue`);

      // console.log("LPOP result:", userKey);

      const ip = userObj.userIP; // 유저 실제 아이피
      const user = userObj.user; // 유저
      const pw = userObj.pw; // 비밀번호
      const content = userObj.content; // 유저가 보낸 데이타
      const PrevRequestTime = await redisClient.GET(`user:<${userIP}>:lastRequestTime`) || 0; // 클라이언트가 기존에 요청했던 시간
      const nowRequestTime = Date.now(); // 클라이언트가 요청을 보낸 시간

      if (nowRequestTime - PrevRequestTime < requestLimitInterval) { // 시간 내에 요청이 너무 많은 상태
        socket.emit("fromBack", "Too many requests"); // 요청이 너무 많기 때문에 null을 반환한다.
      } else { // 요청할 수 있는 상태
        /*
        요청 시간을 세션을 만들때 합치지 않고 완전히 별도로 관리하는 이유는,
        각 ip마다 요청에 허용되는 10초라는 간격이 있는데 유저가 연결을 끊으면 세션에서 유저 정보도 같이 사라지기 때문에,
        한 번 접속한 유저에 대해서는 요청 시간에 대한 기록이 남도록 했다.
        */
        await redisClient.SET(`user:<${userIP}>:lastRequestTime`, nowRequestTime);
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
    }
    redisResponse();
    socket.on("disconnect", async () => {
      await redisClient.SREM(`session`, `user:<${userIP}>`); // 세션에서 유저 제거
      await redisClient.DEL(`user:<${userIP}>`); // 유저 객체 제거시 존재하지 않는 키는 무시된다.
      const cnt = await redisClient.SCARD(`session`);
      socket.emit("decrease", cnt); // 감소 이벤트 실행

      console.log(`Disconnected user: ${socketID}`); // 연결 해제

    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Started websocket server at PORT:${PORT}`); // 서버 열기
});