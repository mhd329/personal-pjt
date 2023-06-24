import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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