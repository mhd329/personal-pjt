import React from "react";
import AllTodos from "../components/AllTodos";
import { useNavigate, useOutletContext } from "react-router-dom";

function AllTodosPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };

    return (
        <div className="content">
            <AllTodos handler={handle401} userId={userId} />
        </div>
    );
}

export default AllTodosPage;