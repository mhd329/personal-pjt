import React from "react";
import NewTodo from "../components/NewTodo";
import SplitPane from "../components/SplitPane";
import { useNavigate } from "react-router";

function NewTodoPage(props) {
    const navigate = useNavigate();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <SplitPane
            header={<h1 className="new-todo__header--title">새 할 것 만들기</h1>}
            main={<NewTodo handler={handle401} />}
        />
    )
}

export default NewTodoPage;