import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Logout from "./Logout";
import 'bootstrap/dist/css/bootstrap.min.css';


function Buttons(props) {
    const { state } = useLocation();
    const navigate = useNavigate();
    // 할 일 페이지
    const goToTodoList = () => {
        navigate(`/todo-page/${state.userId}/todo-list`, {
            state: {
                userId: state.userId,
            },
        });
    };
    // 할 일들 모두 보기
    const goToAllTodos = () => {
        navigate(`/todo-page/${state.userId}/all-todos`, {
            state: {
                userId: state.userId,
            },
        });
    };
    // 새로 만들기
    const goToNewTodo = () => {
        navigate(`/todo-page/${state.userId}/new`, {
            state: {
                userId: state.userId,
            },
        });
    };
    return (
        <div className="buttons">
            {props.newTodo && <div className="buttons__new-todo">
                <Button onClick={goToNewTodo}>새 할 것</Button>
            </div>}
            {props.todoList && <div className="buttons__todo-list">
                <Button onClick={goToTodoList}>할일 보기</Button>
            </div>}
            {props.allTodo && <div className="buttons__all-todos">
                <Button onClick={goToAllTodos}>모두 보기</Button>
            </div>}
            <div className="buttons__logout">
                <Logout />
            </div>
        </div>
    );
}

export default Buttons;