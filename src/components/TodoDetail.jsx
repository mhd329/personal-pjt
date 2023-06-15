import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import client from "../utils/client";
import cookie from "react-cookies";

function TodoDetail(props) {
    const [todoDetail, setTodoDetail] = useState({
        id: 0,
        title: '',
        description: '',
        complete: false,
        created_at: '',
        updated_at: '',
    });
    const { state } = useLocation();


    useEffect(() => {
        async function getTodo() {
            try {
                const response = await client.get(`todo/detail/${state.todoId}`, {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setTodoDetail({
                    id: response.data.id,
                    title: response.data.title,
                    description: response.data.description,
                    complete: response.data.complete,
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                });
            } catch (error) {
                alert(error.response.data.message);
                console.log(error);
                props.handler(error);
            };
        };
        getTodo();
    }, []);


    const handleChange = (event) => {

    };


    return (
        <div>
            <Form noValidate className="todo-detail__form needs-validation">
                <Form.Group className="mb-3" controlId="title">
                    <Form.Label>
                        제목
                    </Form.Label>
                    <Form.Control
                        disabled
                        required
                        type="text"
                        autoComplete="off"
                        value={todoDetail["title"]}
                        maxLength="100"
                    // onChange={}
                    />
                    <Form.Text id="title" muted>
                        {todoDetail["title"].length} / 100
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                        { }
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>상세</Form.Label>
                    <Form.Control
                        disabled
                        as="textarea"
                        rows={10}
                        value={todoDetail["description"]}
                    // onChange={}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="important">
                    <Form.Label>중요도</Form.Label>
                    <Form.Select
                        disabled
                        required
                    // onChange={}
                    >
                        <option value="none">중요도를 선택해주세요.</option>
                        <option value="1">낮음</option>
                        <option value="2">중간</option>
                        <option value="3">높음</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        중요도를 선택하지 않으셨습니다.
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="todo-detail__buttons">
                    <Button className="todo-detail__buttons--submit" variant="primary" type="submit">완료</Button>
                    <Button className="todo-detail__buttons--cancel" variant="danger" type="button">취소</Button>
                </div>
            </Form>
            <Button onClick={handleChange}>수정하기</Button>
        </div>
    );
}

export default TodoDetail;