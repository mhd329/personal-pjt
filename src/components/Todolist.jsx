import React, { useState, useEffect } from "react";
import client from "../utils/client";
import cookie from "react-cookies";

function MapList(props) {
    props.list.map((todo) =>
        <div className="todo__main__todos--obj" key={`todo-id-${todo.id}`}>
            <h6>{todo.title}</h6>
            <p>{todo.important}</p>
            <p>{todo.complete}</p>
        </div>
    );
}

// 일반적인 todolist => 상태 false인 todo 목록이 기본으로 나옴
function TodoList(props) {
    const [todoList, setTodoList] = useState([]);
    useEffect(() => {
        async function getTodoList() {
            try {
                const response = await client.get("todo/todolist", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setTodoList(response.data);
            } catch (error) {
                console.log(error);
                alert(error.response.data.message);
            };
        };
        getTodoList();
    }, []);
    return (
        <div className="todo__main__todos">
            {todoList.length !== 0 ? <MapList list={todoList} /> : <p>아직 할 일이 없습니다.</p>}
        </div>
    );
}

export default TodoList;