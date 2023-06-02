import axios from "axios";
import cookie from 'react-cookies';

const client = axios.create({
    baseURL: "https://localhost:8443/api/v1/accounts/",
    timeout: 5000,
    headers: {
        Authorization: cookie.load("access") ? `Bearer ${cookie.load("access")}` : null,
    }
});

export default client;