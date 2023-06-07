import React, { useState, useEffect, useCallback } from "react";
import { Button } from 'react-bootstrap';
import client from "../utils/client";
import cookie from "react-cookies";

function Todos(props) {
    const [todoList, setTodoList] = useState([]);
    useEffect(() => {
        async function getTodos() {
            try {
                await client.get("todos/todolist", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        setTodoList();
        getAllTodos();
    }, [todoList]);
    const handleClick = useCallback(() => {
        async function postTodo() {
            try {
                await client.post("todos/todo", {
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
            <h1>Todos</h1>
            <Button variant="primary" type="button" onClick={handleClick}>
                새로운 할 일
            </Button>
        </div>
    );
}

export default Todos;