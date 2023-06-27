import React from "react";
import Buttons from "../components/Buttons";
import { Outlet, useLocation } from "react-router-dom";
import TokenRefreshButton from "../components/TokenRefreshButton";
import { Container } from "react-bootstrap";

function TodoHomePage(props) {
    const { pathname, state } = useLocation();
    const notDetail = !pathname.includes("detail")
    const newTodo = notDetail && !pathname.includes("new");
    const todoList = notDetail && pathname.includes("all-todos");
    const allTodos = notDetail && (!pathname.includes("all-todos") && !pathname.includes("new"));
    return (
        <div className="todo__home">
            <div className="todo__home--title">
                <h1>Todos</h1>
            </div>
            <div className="todo__home--content">
                <Outlet context={{ userId: state.userId }} />
            </div>
            <div className="todo__home--buttons">
                <TokenRefreshButton />
                <Buttons newTodo={newTodo} todoList={todoList} allTodos={allTodos} userId={state.userId} />
            </div>
        </div>
    );
}

export default TodoHomePage;