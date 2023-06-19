import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import client from "../utils/client";
import cookie from "react-cookies";


function MapList(props) {
    const { state } = useLocation();
    console.log(props.list)
    function translate(importance) {
        if (importance === "high") {
            return "높음"
        } else if (importance === "middle") {
            return "중간"
        } else if (importance === "low") {
            return "낮음"
        };
    }
    const todoList = props.list.map((todo) => 
        <div className="todo__main__todo-obj" key={`todo-id-${todo.id}`} id={`todo-id-${todo.id}`}>
            <Link to={`detail/${todo.id}`} state={{ todoId: todo.id, userId: state.userId }}>
                <h6>{todo.title}</h6>
                <p>{translate(todo.importance)}</p>
            </Link>
        </div>
    );
    return (
        <div>
            {todoList}
        </div>
    );
}


// 일반적인 todolist => 상태 false인 todo 목록이 기본으로 나옴
function TodoList(props) {
    const [todoList, setTodoList] = useState([]);
    useEffect(() => {
        async function getList() {
            try {
                const response = await client.get("todo/todo-list", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setTodoList(response.data);
            } catch (error) {
                alert(error.response.data.message);
                console.log(error);
                props.handler(error);
            };
        };
        getList();
    }, []);
    return (
        <div className="todo__main__todos">
            {todoList.length === 0 ? <p>아직 할 것이 없습니다.</p> : <MapList list={todoList} />}
        </div>
    );
}

export default TodoList;