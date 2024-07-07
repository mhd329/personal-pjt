import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Logout from "./Logout";
import 'bootstrap/dist/css/bootstrap.min.css';


function Buttons(props) {
    const navigate = useNavigate();
    // 할 일 페이지
    const goToTodoList = () => {
        navigate(`/todo-page/${props.userId}/`, {
            state: {
                userId: props.userId,
            },
        });
    };
    // 할 일들 모두 보기
    const goToAllTodos = () => {
        navigate(`/todo-page/${props.userId}/all-todos/`, {
            state: {
                userId: props.userId,
            },
        });
    };
    // 새로 만들기
    const goToNewTodo = () => {
        navigate(`/todo-page/${props.userId}/new/`, {
            state: {
                userId: props.userId,
            },
        });
    };
    return (
        <div className="buttons">
            {props.newTodo && <div className="buttons__new-todo">
                <Button onClick={goToNewTodo} className="mx-2 mb-3">새 할 것</Button>
            </div>}
            {props.todoList && <div className="buttons__todo-list">
                <Button onClick={goToTodoList} className="mx-2 mb-3">할일 보기</Button>
            </div>}
            {props.allTodos && <div className="buttons__all-todos">
                <Button onClick={goToAllTodos} className="mx-2 mb-3">모두 보기</Button>
            </div>}
            <div className="buttons__logout mx-2 mb-3">
                <Logout />
            </div>
        </div>
    );
}

export default Buttons;