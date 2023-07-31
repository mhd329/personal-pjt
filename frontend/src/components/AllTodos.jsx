import React, { useState, useEffect, useCallback } from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from "react-router-dom";
import client from "../utils/client";
import { Cookies } from "react-cookie";


function MapList(props) {
    function translate(importance) {
        if (importance === "high") {
            return "높음"
        } else if (importance === "middle") {
            return "중간"
        } else if (importance === "low") {
            return "낮음"
        };
    }
    const rawTodoList = props.list;
    const todoList = rawTodoList.map((todo) =>
        <Col className="todo-obj" key={`todo-key-${todo.id}`} id={`todo-id-${todo.id}`}>
            <Link to={`detail/${todo.id}/`} state={{ todoId: todo.id, userId: props.userId }} style={{ textDecoration: "none", color: "black" }}>
                <Card>
                    <Card.Body>
                        <Card.Title>{todo.title}</Card.Title>
                        <Card.Subtitle className="mb-2">{translate(todo.importance)}</Card.Subtitle>
                    </Card.Body>
                </Card>
            </Link>
        </Col>
    );
    const md = 4;
    const mdSize = 4;
    // 길이가 긴 경우 잘라서 반환
    if (todoList.length > mdSize) {
        const tidyTodoList = []
        while (todoList.length > mdSize) {
            const todos = []
            for (let i = 0; i < mdSize; i++) {
                const todo = todoList.shift();
                todos.push(todo);
            };
            tidyTodoList.push(<Row key={tidyTodoList.length} md={md} className="mx-2 my-4">{todos}</Row>);
        };
        tidyTodoList.push(<Row key={tidyTodoList.length} md={md} className="mx-2 my-4">{todoList}</Row>);
        return (
            <>
                {tidyTodoList}
            </>
        );
    } else {
        // 길이가 길지 않으면 그냥 반환
        return (
            <Row key={todoList.length} md={md} className="mx-2 my-4">
                {todoList}
            </Row>
        );
    }
}


// 모든 todolist => 완료 여부를 가리지 않음
function AllTodos(props) {
    const accessToken = useCallback(() => {
        const cookie = new Cookies();
        return cookie.get("access");
    }, []);
    const [allTodosList, setAllTodosList] = useState([]);

    const getList = useCallback(async () => {
        try {
            const response = await client.get("todo/all-todos", {
                headers: {
                    Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
                },
            });
            setAllTodosList(response.data);
        } catch (error) {
            alert(error.response.data.message);
            props.handler(error);
        };
    }, [props, accessToken]);

    useEffect(() => {
        getList();
    }, [getList]);
    return (
        <>
            {allTodosList.length === 0 ? <div className="nothing"><p className="help-text">아무 것도 없습니다.</p></div> : <MapList list={allTodosList} userId={props.userId} />}
        </>
    );
}

export default AllTodos;