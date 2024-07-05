import axios from "axios";

// 쿠키값이 변하면, 변한 쿠키값을 header로 가지는 새로운 client 객체를 만들어야 함 => 각 jsx파일에서 구현
const client = axios.create({
    baseURL: "https://localhost:8443/api/v1/",
    withCredentials: true,
    timeout: 5000,
});

export default client;