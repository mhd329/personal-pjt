import React, { useState, useEffect, useCallback } from "react";
import { Button } from 'react-bootstrap';
import client from "../utils/client";
import cookie from "react-cookies";

function Todos(props) {
    const handleClick = useCallback(() => {
        async function getAllTodos() {
            try {
                await client.get("todo/all-todos", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        postTodo();
    }, []);
    return (
        <div>
            <Button variant="primary" type="button" onClick={handleClick}>
                모두 보기
            </Button>
        </div>
    );
}

export default Todos;