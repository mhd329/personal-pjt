import React from "react";
import SplitPane from "../components/SplitPane";
import { useNavigate } from "react-router";
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
        <SplitPane
            header={<h1 className="header--title">자세히 보기</h1>}
            main={<TodoDetail handler={handle401} />}
            footer={<Button onClick={goBack}>목록으로 가기</Button>}
        />
    )
}

export default TodoDetailPage;