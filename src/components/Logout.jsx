import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import cookie from 'react-cookies';
import client from "../client";
import React from "react";

function Logout(props) {
    const navigate = useNavigate();
    // 로그아웃시 로그인창으로 가기
    const goToLogin = () => {
        navigate("/login")
    };

    const handleClick = () => {
        async function logout() {
            try {
                const response = await client.delete("login");
                // 쿠키 저장및 삭제와 관련된 작업은 서버에서 처리됨
                // cookie.remove("access");
                // cookie.remove("refresh");
                console.log(response);
            } catch (error) {
                console.log(error);
            };
        };
        logout();
        // goToLogin();
    };

    return (
        <Button variant="primary" type="button" onClick={handleClick}>
            로그아웃
        </Button>
    );
}

export default Logout;