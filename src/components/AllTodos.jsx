import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../utils/client";
import cookie from "react-cookies";


function MapList(props) {
    const todoList = props.list.map((todo) =>
        <Link to="detail">
            <div className="todo__main__all-todos-obj" id={`todo-id-${todo.id}`} key={`todo-id-${todo.id}`}>
                <h6>{todo.title}</h6>
                <p>{todo.important}</p>
                <p>{todo.complete}</p>
            </div>
        </Link>
    );
    return (
        <div>
            {todoList}
        </div>
    );
}


// 모든 todolist => 완료 여부를 가리지 않음
function AllTodos(props) {
    const [allTodosList, setAllTodosList] = useState([]);
    useEffect(() => {
        async function getList() {
            try {
                const response = await client.get("todo/all-todos", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setAllTodosList(response.data);
            } catch (error) {
                alert(error.response.data.message);
                props.handler(error);
            };
        };
        getList();
    }, []);
    return (
        <div className="todo__main__all-todos">
            {allTodosList.length === 0 ? <p>아무 것도 없습니다.</p> : <MapList list={allTodosList} />}
        </div>
    );
}

export default AllTodos;