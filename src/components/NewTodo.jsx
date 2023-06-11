import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import client from "../utils/client";
import cookie from "react-cookies";

import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function NewTodo(props) {
    const todoSchema = {
        email: '',
        password: '',
        password2: '',
    };
    const [todo, setTodo] = useState(todoSchema);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [importance, setImportance] = useState('');
    const navigate = useNavigate();
    const goToBack = () => {
        navigate(-1)
    };
    const handleClick = useCallback(() => {
        async function postTodo() {
            try {
                await client.post("todo/todo-list", {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        postTodo();
    }, []);
    return (
        <div className="new-todo">
            <h1 className="new-todo__title">할 것 등록</h1>
            <Form noValidate className="new-todo__form needs-validation" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                    <Form.Label>
                        할 것 이름
                    </Form.Label>
                    <Form.Control
                        required
                        type="text"
                        autoComplete="off"
                        placeholder="100자 이내로 적어주세요."
                        onChange={setTitle}
                        isValid={ }
                        isInvalid={ }
                    />
                    <Form.Control.Feedback type="invalid">
                        100자 초과
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>상세</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={setDescription}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="important">
                    <Form.Label>중요도</Form.Label>
                    <Form.Select
                        required
                        onChange={setImportance}
                        isValid={ }
                        isInvalid={ }
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
                <div className="new-todo__buttons">
                    <Button className="new-todo__buttons--submit" variant="primary" type="submit">완료</Button>
                    <Button className="new-todo__buttons--cancel" variant="danger" type="button" onClick={goToBack}>취소</Button>
                </div>
            </Form>
        </div>
    );
}

export default NewTodo;