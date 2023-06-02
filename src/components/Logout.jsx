import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import client from "../utils/client";
import React, { useCallback } from "react";

function Logout(props) {
    // 로그아웃시 로그인창으로 가기
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/login")
    };

    const handleClick = useCallback(() => {
        async function logout() {
            try {
                const response = await client.delete("login", {
                    withCredentials: true
                });
                console.log(response);
            } catch (error) {
                console.log(error.response.data.message);
            };
        };
        logout();
        goToLogin();
    });

    return (
        <Button variant="primary" type="button" onClick={handleClick}>
            로그아웃
        </Button>
    );
}

export default Logout;