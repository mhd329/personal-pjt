import React from "react";
import Buttons from "../components/Buttons";
import { Outlet, useLocation } from "react-router-dom";
import TokenRefreshButton from "../components/TokenRefreshButton";

function TodoHomePage(props) {
    const { pathname, state } = useLocation();
    return (
        <>
            <h1 className="header--title">Todos</h1>
            <Outlet context={{ userId: state.userId }} />
            <Buttons newTodo={!pathname.includes("new") && !pathname.includes("detail")} todoList={pathname.includes("todo-list") && !pathname.includes("detail")} allTodos={pathname.includes("all-todos") && !pathname.includes("detail")} />
            <TokenRefreshButton />
        </>
    );
}

export default TodoHomePage;