import axios from "axios";
import cookie from 'react-cookies';

const client = axios.create({
    baseURL: "https://127.0.0.1:8000/api/v1/accounts/",
    timeout: 5000,
    headers: {
        "Authorization": cookie.load("access") ? `Bearer ${cookie.load("access")}` : null,
        "Content-Type": "application/json",
        Accept: "application/json",
    }
});

export default client;