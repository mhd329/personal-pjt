import React, { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from "react-router-dom";
import client from "../utils/client";
import cookie from "react-cookies";


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
    const todoList = props.list.map((todo) =>
        <Col xs={4} md={2} className="todo-obj" key={`todo-id-${todo.id}`} id={`todo-id-${todo.id}`}>
            <Link to={`detail/${todo.id}`} state={{ todoId: todo.id, userId: props.userId }} style={{ textDecoration: "none", color: "black" }}>
                <Card>
                    <Card.Body>
                        <Card.Title>{todo.title}</Card.Title>
                        <Card.Subtitle className="mb-2">{translate(todo.importance)}</Card.Subtitle>
                    </Card.Body>
                </Card>
            </Link>
        </Col>
    );
    return (
        <>
            {todoList}
        </>
    );
}


// 모든 todolist => 완료 여부를 가리지 않음
function AllTodos(props) {
    const [allTodosList, setAllTodosList] = useState([]);
    useEffect(() => {
        async function getList() {
            try {
                const response = await client.get("todo/all-todos", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setAllTodosList(response.data);
            } catch (error) {
                alert(error.response.data.message);
                props.handler(error);
            };
        };
        getList();
    }, []);
    return (
        <Row>
            {allTodosList.length === 0 ? <p>아무 것도 없습니다.</p> : <MapList list={allTodosList} userId={props.userId} />}
        </Row>
    );
}

export default AllTodos;