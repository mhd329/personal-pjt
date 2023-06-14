import React from "react";
import Buttons from "../components/Buttons";
import TodoList from "../components/TodoList";
import AllTodos from "../components/AllTodos";
import SplitPane from "../components/SplitPane";
import { useNavigate } from "react-router";

function TodoPage(props) {
    const navigate = useNavigate();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    function contents(contentType, handler) {
        if (contentType === "todo-list") {
            return <TodoList handler={handler} />
        } else if (contentType === "all-todos") {
            return <AllTodos handler={handler} />
        };
    }
    function buttonType(contentType) {
        if (contentType === "todo-list") {
            return <Buttons allTodo={true} />
        } else if (contentType === "all-todos") {
            return <Buttons todoList={true} />
        }
    }
    return (
        <SplitPane
            header={<h1 className="header--title">현재 할 것 목록</h1>}
            main={contents(props.content, handle401)}
            footer={buttonType(props.content)}
        />
    );
}

export default TodoPage;