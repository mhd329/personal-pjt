import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Logout from "./Logout";
import 'bootstrap/dist/css/bootstrap.min.css';


function Buttons(props) {
    const { state } = useLocation();
    const navigate = useNavigate();
    // todo페이지
    const goToTodoList = () => {
        navigate(`/todo-page/${state.uid}/todo-list`, {
            state: {
                uid: state.uid,
            },
        });
    };
    // 모두 보기
    const goToAllTodos = () => {
        navigate(`/todo-page/${state.uid}/all-todos`, {
            state: {
                uid: state.uid,
            },
        });
    };
    // 새로 만들기
    const goToNewTodo = () => {
        navigate(`/todo-page/${state.uid}/new`, {
            state: {
                uid: state.uid,
            },
        });
    };
    return (
        <div className="buttons">
            <div className="buttons__new-todo">
                <Button onClick={goToNewTodo}>새 할 것</Button>
            </div>
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