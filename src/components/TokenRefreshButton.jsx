import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, useLocation } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

import client from "../utils/client";
import cookie from "react-cookies";

function TokenRefresh(props) {
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/account/login");
    };
    const minutes = parseInt(count / 60);
    const seconds = Math.floor(count % 60);
    useEffect(() => {
        async function getExp() {
            try {
                const response = await client.get("accounts/refresh",
                    {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                const timer = (response.data.exp * 1000) - new Date().getTime();
                setCount(timer / 1000);
            } catch (error) {
                alert(error.response);
                console.log(error)
            };
        };
        getExp();
    }, []);
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);
        if (count < 0) {
            setCount(0);
            alert("로그인 시간이 만료되었습니다.\n다시 로그인 해 주세요.");
            clearInterval(timer);
            goToLogin();
        };
        return () => clearInterval(timer);
    }, [count]);
    const handleClick = useCallback(() => {
        async function requestNewToken() {
            try {
                const response = await client.post("accounts/refresh", null, {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                const timer = (response.data.token.exp * 1000) - new Date().getTime();
                setCount(timer / 1000);
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        requestNewToken();
    });
    return (
        <div>
            <Button onClick={handleClick}>로그인 연장</Button>
            <div>{minutes.toString().length === 2 ? minutes : "0" + minutes} : {seconds.toString().length === 2 ? seconds : "0" + seconds}</div>
        </div>
    );
}

function TokenRefreshButton(props) {
    const { pathname } = useLocation();
    return (
        <div>
            {pathname.includes("account") ? null : <TokenRefresh />}
        </div>
    )
}

export default TokenRefreshButton;