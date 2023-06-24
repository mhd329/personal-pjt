import { useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import client from "../utils/client";
import cookie from "react-cookies";

function TodoDetail(props) {
    const [todoDetail, setTodoDetail] = useState({});
    const [todoDetailTemp, setTodoDetailTemp] = useState({});
    const { state } = useLocation();
    const title = useRef(null);
    const description = useRef(null);
    const importance = useRef(null);
    const buttons = useRef(null);

    function setData(setFunctionArray, response) {
        setFunctionArray.map((f) => {
            f({
                id: response.data.id,
                title: response.data.title,
                description: response.data.description,
                importance: response.data.importance,
                complete: response.data.complete,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
            })
        })
    }

    useEffect(() => {
        async function getTodo() {
            try {
                const response = await client.get(`todo/detail/${state.todoId}`, {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setData([setTodoDetail, setTodoDetailTemp], response);
            } catch (error) {
                console.log(error)
                // alert(error.response.data.message);
                // props.handler(error);
            };
        };
        getTodo();
    }, []);

    const handleTitleChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            title: event.currentTarget.value,
        })
    };

    const handleDescriptionChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            description: event.currentTarget.value,
        })
    };

    const handleImportantChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            importance: event.currentTarget.value,
        })
    };

    const handleClick = (event) => {
        title.current.disabled = false;
        description.current.disabled = false;
        importance.current.disabled = false;
        buttons.current.hidden = false;
    };

    const handleCancellation = (event) => {
        setTodoDetail({
            ...todoDetail,
            title: todoDetailTemp["title"],
            description: todoDetailTemp["description"],
            importance: todoDetailTemp["importance"],
        })
        title.current.value = todoDetailTemp["title"];
        description.current.value = todoDetailTemp["description"];
        importance.current.value = todoDetailTemp["importance"];
        title.current.disabled = true;
        description.current.disabled = true;
        importance.current.disabled = true;
        buttons.current.hidden = true;
    };

    const handleSubmit = useCallback((event) => {
        if ((todoDetail["title"].length !== 0) && (todoDetail["importance"] !== "none")) {
            async function patchTodo() {
                try {
                    const response = await client.patch(`todo/detail/${state.todoId}`, todoDetail, {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                    console.log(response);
                } catch (error) {
                    alert(error.response.data.message);
                    props.handler(error);
                };
            };
            patchTodo();
        };
        event.preventDefault();
        event.stopPropagation();
    });

    return (
        <div>
            <Form noValidate className="todo-detail__form needs-validation">
                <Form.Group className="mb-3" controlId="title" onSubmit={handleSubmit}>
                    <Form.Label>
                        제목
                    </Form.Label>
                    <Form.Control
                        ref={title}
                        disabled
                        required
                        type="text"
                        autoComplete="off"
                        defaultValue={todoDetail["title"]}
                        maxLength="100"
                        onChange={handleTitleChange}
                        isInvalid={todoDetail["title"] ? todoDetail["title"].length === 0 : true}
                    />
                    <Form.Text muted>
                        {todoDetail["title"] ? todoDetail["title"].length : 0} / 100
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                        제목을 입력해주세요.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>상세</Form.Label>
                    <Form.Control
                        ref={description}
                        disabled
                        as="textarea"
                        rows={10}
                        defaultValue={todoDetail["description"]}
                        onChange={handleDescriptionChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="importance">
                    <Form.Label>중요도</Form.Label>
                    <Form.Select
                        ref={importance}
                        key={todoDetail["id"]}
                        defaultValue={todoDetail["importance"]}
                        isInvalid={todoDetail["importance"] === "none"}
                        disabled
                        required
                        onChange={handleImportantChange}
                    >
                        <option value="none">중요도를 선택해주세요.</option>
                        <option value="low">낮음</option>
                        <option value="middle">중간</option>
                        <option value="high">높음</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        중요도를 선택해주세요.
                    </Form.Control.Feedback>
                </Form.Group>
                <div id="buttons" ref={buttons} className="todo-detail__buttons" hidden>
                    <Button className="todo-detail__buttons--submit" variant="primary" type="submit">완료</Button>
                    <Button className="todo-detail__buttons--cancel" variant="danger" type="button" onClick={handleCancellation}>취소</Button>
                </div>
            </Form>
            <Button onClick={handleClick}>수정하기</Button>
        </div>
    );
}

export default TodoDetail;