import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import client from "../utils/client";
import { Cookies } from "react-cookie";
import Swal from "sweetalert2";

// 날짜가 ISO 8601 형식으로 나온다.
// 사용자 관점에서 보기 편한 방식으로 conversion 하기 위한 함수
// 첫 렌더링시 날짜 데이터가 들어오지 않는(rowDate === undifined: 날짜를 비롯한 detail은 useEffect로 렌더링이 끝난 후 응답된다.)
// 상황에 대한 조건문을 추가하였다.
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

// todoDetail 메인 컴포넌트

function TodoDetail(props) {
    const accessToken = useCallback(() => {
        const cookie = new Cookies();
        return cookie.get("access");
    }, []);
    const navigate = useNavigate();
    const { state } = useLocation();

    const [todoDetail, setTodoDetail] = useState({});
    const [todoDetailTemp, setTodoDetailTemp] = useState({});

    const [complete, setComplete] = useState(false);
    const [deleteTodo, setDeleteTodo] = useState(false);

    const title = useRef(null);
    const description = useRef(null);
    const importance = useRef(null);
    const buttonGroup1 = useRef(null);
    const buttonGroup2 = useRef(null);
    const changeButton = useRef(null);
    const updatedAt = useRef(null);

    // 요청에 대한 응답이 오면 todoDetail, todoDetailTemp 두 state의 set함수를 사용하기 위한 함수
    // 첫 번째 매개변수로 set함수가 담긴 배열이 들어가고 두 번째로 응답이 들어간다.
    const setData = useCallback((setFunctionArray, response) => {
        setFunctionArray.map((setFunction) => {
            return setFunction({
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
    }, [props]);

    // 목록으로 가기(뒤로가기)

    const goBack = () => {
        navigate(-1);
    };

    // todo detail get요청

    const getTodo = useCallback(async () => {
        try {
            const response = await client.get(`todo/detail/${state.todoId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
                },
            });
            setData([setTodoDetail, setTodoDetailTemp], response);
            setComplete(response.data.complete);
        } catch (error) {
            alert(error.response.data.message);
            props.handler(error);
        };
    }, [props, accessToken, setData, state]);

    useEffect(() => {
        getTodo();
    }, [getTodo]);

    // 제목 변경

    const handleTitleChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            title: event.currentTarget.value,
        })
    };

    // 상세 변경

    const handleDescriptionChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            description: event.currentTarget.value,
        })
    };

    // 중요도 변경

    const handleImportantChange = (event) => {
        setTodoDetail({
            ...todoDetail,
            importance: event.currentTarget.value,
        })
    };

    // todo 완료처리 버튼

    const handleComplete = useCallback((event) => {
        Swal.fire({
            title: "정말 완료 하시겠습니까?",
            text: "완료하는 경우 더 이상 수정할 수 없습니다.",
            showCancelButton: true,
            confirmButtonColor: "red",
            cancelButtonColor: "gray",
            confirmButtonText: "완료",
            cancelButtonText: "취소",
        }).then((result) => {
            if (result.isConfirmed) {
                setTodoDetail({
                    ...todoDetail,
                    complete: true,
                });
                setComplete(true);
            };
        });
    }, [todoDetail]);

    // todo 완료처리 request

    const completeTodo = useCallback(async () => {
        try {
            const response = await client.patch(`todo/detail/${state.todoId}`, todoDetail, {
                headers: {
                    Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
                },
            });
            if (response.status === 202) {
                title.current.disabled = true;
                description.current.disabled = true;
                importance.current.disabled = true;
                buttonGroup2.current.hidden = true;
                changeButton.current.hidden = true;
            };
        } catch (error) {
            console.log(error)
            alert(error.response.data.message);
            props.handler(error);
        };
    }, [props, state, todoDetail, accessToken]);

    useEffect(() => {
        if (complete) {
            completeTodo();
        };
    }, [completeTodo, complete]);

    // todo 삭제처리 버튼

    const handleDelete = useCallback((event) => {
        Swal.fire({
            title: "정말 삭제 하시겠습니까?",
            text: "삭제하면 더 이상 확인할 수 없습니다.",
            showCancelButton: true,
            confirmButtonColor: "red",
            cancelButtonColor: "gray",
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        }).then((result) => {
            if (result.isConfirmed) {
                setDeleteTodo(true);
            };
        });
    }, []);

    // todo 삭제처리 요청

    const removeTodo = useCallback(async () => {
        try {
            const response = await client.delete(`todo/detail/${state.todoId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
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
    }, [accessToken, navigate, props, state]);

    useEffect(() => {
        if (deleteTodo) {
            removeTodo();
        };
    }, [removeTodo, deleteTodo]);

    // 수정하기 버튼

    const handleChangeButton = (event) => {
        console.log(buttonGroup1);
        title.current.disabled = false;
        description.current.disabled = false;
        importance.current.disabled = false;
        buttonGroup1.current.hidden = true;
        buttonGroup2.current.hidden = false;
    };

    // 취소 버튼

    const handleCancellation = (event) => {
        cancel();
    };

    // 취소처리 함수
    // 취소하는 경우 변경 전의 값으로 돌아가면서 수정 등의 버튼들을 비활성화한다.

    const cancel = useCallback(() => {
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
        buttonGroup1.current.hidden = false;
        buttonGroup2.current.hidden = true;
        changeButton.current.hidden = false;
    }, [todoDetail, todoDetailTemp]);

    // 비교 함수
    // 수정 시 temp의 내용과 달라진 점이 있는지 비교검사하는 함수
    // 전과 같다면 true, 달라졌다면 false를 리턴한다.

    const compare = useCallback(() => {
        if (todoDetail["title"] === todoDetailTemp["title"] &&
            todoDetail["description"] === todoDetailTemp["description"] &&
            todoDetail["importance"] === todoDetailTemp["importance"]) {
            return true;
        };
        return false;
    }, [todoDetail, todoDetailTemp]);

    // 수정 후 서버로 제출

    const patchTodo = useCallback(async () => {
        try {
            const response = await client.patch(`todo/detail/${state.todoId}`, todoDetail, {
                headers: {
                    Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
                },
            });
            if (response.status === 202) {
                setData([setTodoDetail, setTodoDetailTemp], response);
                title.current.disabled = true;
                description.current.disabled = true;
                importance.current.disabled = true;
                buttonGroup2.current.hidden = true;
                changeButton.current.hidden = false;
            };
        } catch (error) {
            alert(error.response.data.message);
            props.handler(error);
        };
    }, [accessToken, props, setData, state, todoDetail]);

    // 수정 후 제출버튼 클릭

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (compare()) {
            // 변화가 없다면 취소처리한다.
            cancel();
        } else if ((todoDetail["title"].length !== 0) && (todoDetail["importance"] !== "none")) {
            // 변화가 있다면 유효성 검사 후 수정 요청
            patchTodo();
        } else {
            Swal.fire({
                icon: "error",
                text: "다시 입력해주세요.",
                confirmButtonText: "확인",
            });
        };
        event.preventDefault();
        event.stopPropagation();
    }, [patchTodo, cancel, compare, todoDetail]);

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
                <div className="todo-detail__buttons">
                    <div ref={buttonGroup1} className="todo-detail__buttons__completion">
                        <Button ref={changeButton} onClick={handleChangeButton} className="mx-2">
                            수정하기
                        </Button>
                        {todoDetail["complete"] ? <Button className="mx-2" variant="secondary" disabled>
                            완료됨
                        </Button> : <Button className="mx-2" variant="warning" onClick={handleComplete}>
                            완료하기
                        </Button>}
                        <Button className="mx-2" variant="danger" onClick={handleDelete}>
                            삭제하기
                        </Button>
                    </div>
                </div>
                <div className="todo-detail__buttons mb-3">
                    <div ref={buttonGroup2} className="todo-detail__buttons__change" hidden>
                        <Button className="todo-detail__buttons--submit mx-2" variant="primary" type="submit" onClick={handleSubmit}>수정 완료</Button>
                        <Button className="todo-detail__buttons--cancel mx-2" variant="danger" type="button" onClick={handleCancellation}>취소</Button>
                    </div>
                </div>
                <div className="todo-detail__buttons">
                    <Button onClick={goBack} className="mx-2">목록으로 가기</Button>
                </div>
            </Form>
        </div>
    );
}

export default TodoDetail;