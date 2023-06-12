import React from "react";
import Buttons from "../components/Buttons";
import TodoList from "../components/TodoList";
import AllTodos from "../components/AllTodos";
import SplitPane from "../components/SplitPane";

function TodoPage(props) {
    function contents(contentType) {
        if (contentType === "todo-list") {
            return <TodoList />
        } else if (contentType === "all-todos") {
            return <AllTodos />
        };
    };
    return (
        <SplitPane
            header={<h1 className="todo__header--title">현재 할 것 목록</h1>}
            main={contents(props.content)}
            footer={<Buttons />}
        />
    );
}

export default TodoPage;