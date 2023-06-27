import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import NewTodo from "../components/NewTodo";

function NewTodoPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <>
            <NewTodo handler={handle401} userId={userId} />
        </>
    )
}

export default NewTodoPage;