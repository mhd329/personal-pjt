import React, { useCallback, useEffect, useState } from "react";

import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';

import client from "../utils/client";
import cookie from "react-cookies";

function TokenRefreshButton(props) {

    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(count => count + 1);
        }, 1000);
        return () => clearInterval(id);
    }, [])

    const handleClick = () => {
        async function requestNewToken() {
            try {
                const response = await client.post("accounts/refresh", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
            } catch (error) {
                alert(error.response.data.message);
            };
            requestNewToken();
        };
    };
    return (
        <div>
            <Button onClick={handleClick}></Button>
        </div>
    );
}

export default TokenRefreshButton;