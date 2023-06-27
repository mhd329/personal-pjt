import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import client from "../utils/client";
import React, { useCallback } from "react";

import cookie from "react-cookies";

function Logout(props) {
    // 로그아웃시 로그인창으로 가기
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate("/account/login");
    };

    const handleClick = useCallback(() => {
        async function logout() {
            try {
                await client.delete("accounts/logout", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                goToLogin();
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        logout();
    }, [cookie.load("access")]);

    return (
        <Button variant="warning" type="button" onClick={handleClick}>
            로그아웃
        </Button>
    );
}

export default Logout; 