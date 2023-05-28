import axios from "axios";

const client = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1/accounts/",
    timeout: 5000,
});

export default client;