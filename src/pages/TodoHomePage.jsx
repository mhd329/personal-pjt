import React from "react";
import Buttons from "../components/Buttons";
import { Outlet, useLocation } from "react-router-dom";
import TokenRefreshButton from "../components/TokenRefreshButton";

// 기초가 되는 페이지
// 인덱스 페이지로 TodoList가 렌더링 된다.
// 그 밖의 컴포넌트 페이지들은 Outlet으로 각 조건에 의해 번갈아가며 렌더링된다.

function TodoHomePage(props) {
    const { pathname, state } = useLocation();
    // 버튼 렌더링에 대한 조건을 정의하기 위한 상수 선언
    // 각 버튼들은 자기 이름이 들어가는 페이지에서는 렌더링되면 안된다.
    const notDetail = !pathname.includes("detail") // 디테일 페이지를 제외한 페이지들
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