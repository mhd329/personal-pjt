import React from "react";
import { useNavigate } from "react-router";
import NewTodo from "../components/NewTodo";
import SplitPane from "../components/SplitPane";

function NewTodoPage(props) {
    const navigate = useNavigate();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <SplitPane
            header={<h1 className="header--title">새 할 것 만들기</h1>}
            main={<NewTodo handler={handle401} />}
        />
    )
}

export default NewTodoPage;