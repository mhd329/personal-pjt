import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import NewTodo from "../components/NewTodo";

function NewTodoPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) { // 엑세스토큰 만료시 페이지 이동
            navigate("/account/login/");
        };
    };
    return (
        <>
            <NewTodo handler={handle401} userId={userId} />
        </>
    )
}

export default NewTodoPage;