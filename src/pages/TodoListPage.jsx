import React from "react";
import TodoList from "../components/TodoList";
import { useNavigate, useOutletContext } from "react-router-dom";

function TodoListPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };

    return (
        <div className="content">
            <TodoList handler={handle401} userId={userId} />
        </div>
    );
}

export default TodoListPage;