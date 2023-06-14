import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from 'react-bootstrap';
import client from "../utils/client";
import cookie from "react-cookies";

function TodoDetail(props) {
    const [todoDetail, setTodoDetail] = useState();
    const { state } = useLocation();


    useEffect(() => {
        async function postTodo() {
            try {
                const response = await client.get(`todo/detail/${state.todoId}`, {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                console.log(response);
                console.log(state.todoId);
            } catch (error) {
                alert(error.response.data.message);
                props.handler(error);
            };
        };
        postTodo();
    }, []);


    const handleChange = (event) => {

    };


    return (
        <div>
            <Button variant="primary" type="button" onClick={handleChange}>
                수정하기
            </Button>
        </div>
    );
}

export default TodoDetail;