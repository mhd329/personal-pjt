import React, { useCallback, useEffect, useState } from "react";

import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

import client from "../utils/client";
import cookie from "react-cookies";


function TokenRefreshButton(props) {
    const [count, setCount] = useState(1800);
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/account/login");
    };
    const minutes = parseInt(count / 60);
    const seconds = count % 60;
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);
        if (count === -1) {
            alert("로그인 시간이 만료되었습니다.\n다시 로그인 해 주세요.");
            clearInterval(timer);
            goToLogin();
        };
        return () => clearInterval(timer);
    }, [count])
    const handleClick = useCallback(() => {
        async function requestNewToken() {
            try {
                await client.post("accounts/refresh", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        requestNewToken();
        setCount(1800);
    });
    return (
        <div>
            <Button onClick={handleClick}>로그인 연장</Button>
            <div>{minutes} : {seconds}</div>
        </div>
    );
}

export default TokenRefreshButton;