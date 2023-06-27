import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import client from "../utils/client";
import cookie from "react-cookies";

function convert(rowDate) {
    if (!rowDate) {
        return rowDate;
    };
    const datetime = new Date(rowDate.replace("+09:00", "Z"));
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "UTC",
    };
    const formattedDate = new Intl.DateTimeFormat('ko-kr', options).format(datetime);
    return formattedDate;
}

function TodoDetail(props) {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [todoDetail, setTodoDetail] = useState({});
    const [todoDetailTemp, setTodoDetailTemp] = useState({});
    const [complete, setComplete] = useState(false);
    const [deleteTodo, setDeleteTodo] = useState(false);
    const title = useRef(null);
    const description = useRef(null);
    const importance = useRef(null);
    const buttons = useRef(null);
    const changeButton = useRef(null);
    const updatedAt = useRef(null);
    function setData(setFunctionArray, response) {
        setFunctionArray.map((f) => {
            return f({
                user: props.userId,
                id: response.data.id,
                title: response.data.title,
                description: response.data.description,
                importance: response.data.importance,
                complete: response.data.complete,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
            });
        });
    }

    const goBack = () => { // 목록으로 가기(뒤로가기)
        navigate(-1);
    };

    useEffect(() => {
        async function getTodo() {
            try {
                const response = await client.get(`todo/detail/${state.todoId}`, {
                    headers: {
                        Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                    },
                });
                setData([setTodoDetail, setTodoDetailTemp], response);
                setComplete(response.data.complete);
            } catch (error) {
                alert(error.response.data.message);
                props.handler(error);
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

    const handleComplete = useCallback((event) => {
        const answer = window.confirm("정말 완료 하시겠습니까?\n완료하는 경우 더 이상 수정할 수 없습니다.");
        if (answer) {
            setTodoDetail({
                ...todoDetail,
                complete: true,
            });
            setComplete(true);
        };
    }, [todoDetail]);
    useEffect(() => {
        if (complete) {
            async function completeTodo() {
                try {
                    const response = await client.patch(`todo/detail/${state.todoId}`, todoDetail, {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                    if (response.status === 202) {
                        title.current.disabled = true;
                        description.current.disabled = true;
                        importance.current.disabled = true;
                        buttons.current.hidden = true;
                        changeButton.current.hidden = true;
                    };
                } catch (error) {
                    console.log(error)
                    alert(error.response.data.message);
                    props.handler(error);
                };
            };
            completeTodo();
        };
    }, [complete]);

    const handleDelete = useCallback((event) => {
        const answer = window.confirm("정말 삭제 하시겠습니까?\n삭제하면 더 이상 확인할 수 없습니다.");
        if (answer) {
            setDeleteTodo(true);
        };
    }, []);

    useEffect(() => {
        if (deleteTodo) {
            async function removeTodo() {
                try {
                    const response = await client.delete(`todo/detail/${state.todoId}`, {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                    if (response.status === 200) {
                        navigate(`/todo-page/${props.userId}/all-todos`, {
                            state: {
                                userId: props.userId,
                            },
                        })
                    };
                } catch (error) {
                    console.log(error)
                    alert(error.response.data.message);
                    props.handler(error);
                };
            };
            removeTodo();
        };
    }, [deleteTodo]);

    const handleClick = (event) => {
        title.current.disabled = false;
        description.current.disabled = false;
        importance.current.disabled = false;
        buttons.current.hidden = false;
        changeButton.current.hidden = true;
    };

    function cancel() {
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
        changeButton.current.hidden = false;
    }

    const handleCancellation = (event) => {
        cancel();
    };

    function compare() {
        if (todoDetail["title"] === todoDetailTemp["title"] &&
            todoDetail["description"] === todoDetailTemp["description"] &&
            todoDetail["importance"] === todoDetailTemp["importance"]) {
            return true;
        };
        return false;
    }

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (compare()) {
            cancel();
        } else if ((todoDetail["title"].length !== 0) && (todoDetail["importance"] !== "none")) {
            async function patchTodo() {
                try {
                    const response = await client.patch(`todo/detail/${state.todoId}`, todoDetail, {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                    if (response.status === 202) {
                        setData([setTodoDetail, setTodoDetailTemp], response);
                        title.current.disabled = true;
                        description.current.disabled = true;
                        importance.current.disabled = true;
                        buttons.current.hidden = true;
                        changeButton.current.hidden = false;
                    };
                } catch (error) {
                    alert(error.response.data.message);
                    props.handler(error);
                };
            };
            patchTodo();
        } else {
            alert("다시 입력해주세요.");
        };
        event.preventDefault();
        event.stopPropagation();
    }, [todoDetail]);

    return (
        <div className="todo-detail">
            <h1 className="todo-detail__title mb-5">자세히 보기</h1>
            <Form noValidate className="todo-detail__form needs-validation">
                <Form.Group className="mb-3" controlId="title">
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
                <div className="todo-detail__time">
                    <p className="mb-0">작성일: {convert(todoDetail["created_at"])}</p>
                    <p ref={updatedAt}>수정일: {convert(todoDetail["updated_at"])}</p>
                </div>
                <div className="todo-detail__buttons__completion">
                    {todoDetail["complete"] ? <Button className="mb-3 mx-2" variant="secondary" disabled>
                        완료됨
                    </Button> : <Button className="mb-3 mx-2" variant="primary" onClick={handleComplete}>
                        완료하기
                    </Button>}
                    <Button className="mb-3 mx-2" variant="danger" onClick={handleDelete}>
                        삭제하기
                    </Button>
                </div>
                <div className="todo-detail__buttons">
                    <div ref={buttons} className="todo-detail__buttons__change" hidden>
                        <Button className="todo-detail__buttons--submit mx-2" variant="primary" type="submit" onClick={handleSubmit}>수정 완료</Button>
                        <Button className="todo-detail__buttons--cancel mx-2" variant="danger" type="button" onClick={handleCancellation}>취소</Button>
                    </div>
                    <Button ref={changeButton} onClick={handleClick} className="mx-2">수정하기</Button>
                    <Button onClick={goBack} className="mx-2">목록으로 가기</Button>
                </div>
            </Form>
        </div>
    );
}

export default TodoDetail;