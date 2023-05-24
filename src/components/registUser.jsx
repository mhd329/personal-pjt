import axios from "axios"
import { useState } from "react";

const client = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1/",
    timeout: 5000,
});

function registUser(userDateSet) {
    const [userAccessToken, setUserAccessToken] = useState("");
    const [userRefreshToken, setUserRefreshToken] = useState("");

    const email = userDateSet[0];
    const pw1 = userDateSet[1];
    const pw2 = userDateSet[2];


}

export default registUser;