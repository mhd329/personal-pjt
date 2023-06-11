import React from "react";
import Buttons from "../components/Buttons";
import TodoList from "../components/TodoList";
import SplitPane from "../components/SplitPane";

function TodoListPage(props) {
    return (
        <SplitPane
            header={<h1 className="todo__header--title">현재 할 것 목록</h1>}
            main={<TodoList />}
            footer={<Buttons />}
        />
    );
}

export default TodoListPage;