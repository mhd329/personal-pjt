import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import client from "../utils/client";
import { Cookies } from "react-cookie";

import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Swal from "sweetalert2";

function NewTodo(props) {
    const accessToken = useCallback(() => {
        const cookie = new Cookies();
        return cookie.get("access");
    }, []);

    // todo 상태 초기화
    const [todo, setTodo] = useState({});

    // 각 항목 초기화
    const [title, setTitle] = useState(''); // todo 제목
    const [description, setDescription] = useState(''); // todo 설명: 필수 아님
    const [importance, setImportance] = useState(''); // todo 중요도
    const [formSubmitted, setFormSubmitted] = useState(false); // 폼 제출 여부: 유효성 통과해야 제출됨
    const [invalidMessage, setInvalidMessage] = useState(''); // 유효하지 않은 항목에 대한 text 설명: todo 제목에 사용

    // 유효성 객체 생성 및 초기화
    const [checkFormValid, setCheckFormValid] = useState(false); // 제출 버튼 클릭시 유효성 검사 실행
    const [validationObj, setValidationObj] = useState({
        title: false,
        importance: false,
    });

    // 전달받은 uid
    const uid = props.userId;

    // navigation 생성
    const navigate = useNavigate();
    const goToBack = () => {
        navigate(-1); // 취소 버튼 클릭 시 뒤로 가기
    };
    const goToList = useCallback(() => {
        navigate(`/todo-page/${uid}/`, {
            state: {
                userId: uid,
            },
        }); // 만들기 성공하면 리스트로 가기
    }, [navigate, uid]);

    // 제출 버튼 클릭
    const handleSubmit = useCallback((event) => {
        setCheckFormValid(true); // 유효성 검사 실행
        if (validationObj["title"] && validationObj["importance"]) {
            setTodo({
                ...todo,
                user: uid,
                title: title,
                description: description,
                importance: importance,
            });
            setFormSubmitted(true);
        } else {
            Swal.fire({
                icon: "warning",
                text: "올바른 값을 작성해주세요.",
                confirmButtonText: "확인",
            });
        };
        event.preventDefault();
        event.stopPropagation();
    }, [todo, description, importance, title, uid, validationObj]);

    // 제목 입력시 이벤트 감지하여 제목 설정
    const handleTitleChange = (event) => {
        const titleLength = event.currentTarget.value.length;
        setTitle(event.currentTarget.value);
        if (titleLength === 0) {
            setInvalidMessage("필수 입력")
            setValidationObj({
                ...validationObj,
                title: false,
            });
        } else if (titleLength > 100) {
            setInvalidMessage("100자 초과")
            setValidationObj({
                ...validationObj,
                title: false,
            });
        } else if (titleLength !== 0 && titleLength <= 100) {
            setInvalidMessage('');
            setValidationObj({
                ...validationObj,
                title: true,
            });
        }
    };

    // 설명 입력
    const handleDescriptionChange = (event) => {
        setDescription(event.currentTarget.value);
    };

    // 중요도 선택
    const handleImportanceChange = (event) => {
        const importanceValue = event.currentTarget.value;
        setImportance(importanceValue);
        if (importanceValue !== "none" && (importanceValue === "low" || importanceValue === "middle" || importanceValue === "high")) {
            setValidationObj({
                ...validationObj,
                importance: true,
            });
        } else {
            setValidationObj({
                ...validationObj,
                importance: false,
            });
        }
    };

    // 폼 제출 요청
    const postTodo = useCallback(async () => {
        try {
            const response = await client.post("todo/todo-list",
                todo,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken() ? accessToken() : null}`,
                    },
                });
            console.log(response);
            if (response.status === 201) {
                goToList();
            }
        } catch (error) {
            alert(error.response.data.message);
            props.handler(error);
        };
    }, [todo, props, accessToken, goToList]);

    // 폼 제출시 axios 요청 작동
    useEffect(() => {
        if (formSubmitted) {
            postTodo();
        };
    }, [postTodo, formSubmitted]);


    return (
        <div className="new-todo">
            <h1 className="new-todo__title mb-5">새 할 것 만들기</h1>
            <Form noValidate className="new-todo__form needs-validation" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                    <Form.Label>
                        제목
                    </Form.Label>
                    <Form.Control
                        required
                        type="text"
                        autoComplete="off"
                        placeholder="100자 이내로 적어주세요."
                        onChange={handleTitleChange}
                        maxLength="100"
                        isValid={validationObj["title"]}
                        isInvalid={checkFormValid && !validationObj["title"]}
                    />
                    <Form.Text id="title" muted>
                        {title.length} / 100
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                        {invalidMessage}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                    <Form.Label>상세</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        onChange={handleDescriptionChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="important">
                    <Form.Label>중요도</Form.Label>
                    <Form.Select
                        required
                        onChange={handleImportanceChange}
                        isValid={validationObj["importance"]}
                        isInvalid={checkFormValid && !validationObj["importance"]}
                    >
                        <option value="none">중요도를 선택해주세요.</option>
                        <option value="low">낮음</option>
                        <option value="middle">중간</option>
                        <option value="high">높음</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        중요도를 선택하지 않으셨습니다.
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="new-todo__buttons">
                    <Button className="new-todo__buttons--submit mx-2" variant="primary" type="submit">완료</Button>
                    <Button className="new-todo__buttons--cancel mx-2" variant="danger" type="button" onClick={goToBack}>취소</Button>
                </div>
            </Form>
        </div>
    );
}

export default NewTodo;