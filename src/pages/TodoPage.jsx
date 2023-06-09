import React from "react";
import Logout from "../components/Logout";
import TodoList from "../components/Todolist";
import SplitPane from "../components/SplitPane";

function TodoPage(props) {

    return (
        <div>
            <SplitPane
                header={<h1 className="todo__header--title">할 일 목록</h1>}
                main={<TodoList />}
                footer={<Logout />}
            />
        </div>
    );
}

export default TodoPage;