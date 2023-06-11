import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Logout from "./Logout";
import NewTodo from "./NewTodo";
import 'bootstrap/dist/css/bootstrap.min.css';


function Buttons(props) {
    const navigate = useNavigate();
    // todo페이지
    const goToTodoList = () => {
        navigate("/todo-list")
    };
    // 모두 보기
    const goToAllTodos = () => {
        navigate("/all-todos")
    };
    return (
        <div className="buttons">
            {/* <div className="buttons__new-todo">
                <Button onClick={<NewTodo />}>새 할일</Button>
            </div> */}
            <div className="buttons__todo-list">
                <Button onClick={goToTodoList}>할일 보기</Button>
            </div>
            <div className="buttons__all-todos">
                <Button onClick={goToAllTodos}>모두 보기</Button>
            </div>
            <div className="buttons__logout">
                <Logout />
            </div>
        </div>
    );
}

export default Buttons;