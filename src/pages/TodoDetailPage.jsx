import React from "react";
import { useNavigate } from "react-router-dom";
import TodoDetail from "../components/TodoDetail";
import { Button } from "react-bootstrap";

function TodoDetailPage(props) {
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    };
    const handle401 = (AxiosResponse) => {
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login");
        };
    };
    return (
        <>
            <h1 className="header--title">자세히 보기</h1>
            <TodoDetail handler={handle401} />
            <Button onClick={goBack}>목록으로 가기</Button>
        </>
    )
}

export default TodoDetailPage;