import React from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Logout from "./Logout";
import 'bootstrap/dist/css/bootstrap.min.css';


function Buttons(props) {
    const { pathname, state } = useLocation();
    const navigate = useNavigate();
    // todo페이지
    const goToTodoList = () => {
        navigate(`${pathname}/todo-list`);
    };
    // 모두 보기
    const goToAllTodos = () => {
        navigate(`${pathname}/all-todos`);
    };
    // 새로 만들기
    const goToNewTodo = () => {
        navigate(`${pathname}/new`);
    };
    return (
        <div className="buttons">
            <div className="buttons__new-todo">
                <Button onClick={goToNewTodo}>새 할 것</Button>
            </div>
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