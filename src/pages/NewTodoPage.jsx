import React from "react";
import { useNavigate } from "react-router-dom";
import NewTodo from "../components/NewTodo";

function NewTodoPage(props) {
    const navigate = useNavigate();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <>
            <NewTodo handler={handle401} />
        </>
    )
}

export default NewTodoPage;