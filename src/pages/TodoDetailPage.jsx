import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import TodoDetail from "../components/TodoDetail";

function TodoDetailPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <>
            <TodoDetail handler={handle401} userId={userId} />
        </>
    )
}

export default TodoDetailPage;