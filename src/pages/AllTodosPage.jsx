import React from "react";
import Buttons from "../components/Buttons";
import AllTodos from "../components/AllTodos";
import { useNavigate } from "react-router-dom";

function AllTodosPage(props) {
    const navigate = useNavigate();
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };

    return (
        <>
            <AllTodos handler={handle401} />
        </>
    );
}

export default AllTodosPage;