import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import useValidation from "../hooks/useValidation";
import client from "../utils/client";

import Swal from "sweetalert2";

function SignUp(props) {
    const userSchema = {
        email: '',
        password: '',
        password2: '',
    };
    const [userData, setUserData] = useValidation(userSchema);
    const [checkFormValid, setCheckFormValid] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [userObj, userValidation] = userData;

    const navigate = useNavigate();
    // 취소버튼 로그인창으로 돌아가기
    const goToLogin = () => {
        navigate(-1)
    };
    // 로그인 성공시 todo 홈페이지로 간다.
    const goToMain = useCallback((uid) => {
        navigate(`/todo-page/${uid}/`, {
            state: {
                userId: uid,
            },
        });
    }, [navigate]);

    // 서버로 post요청
    const createUser = useCallback(async () => {
        try {
            const response = await client.post("accounts/register", userObj);
            goToMain(response.data.uid);
        } catch (error) {
            alert(error.response.data.message);
        };
    }, [goToMain, userObj]);

    useEffect(() => {
        if (formSubmitted) {
            createUser();
        };
        // 제출 완료한다음 제출 여부를 다시 false로 바꿈
        // 1. formSubmitted이 true일 때만 제출하게 되면 컴포넌트 마운트 될 때마다 서버와 통신하게 되는 것이 방지된다.
        // 2. 잘못된 제출의 경우 다시 제출하기 위해서 false로 바꿔줘야 한다.
        setFormSubmitted(false);
    }, [createUser, formSubmitted]);

    // 폼 제출버튼 클릭시 작동하는 함수
    // 폼 전체 유효성 검사 실행
    const completion = userValidation["email"] && userValidation["password"] && userValidation["password2"]
    const handleSubmit = useCallback((event) => {
        setCheckFormValid(true);
        if (completion) {
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
    }, [completion]);

    return (
        <div className="signup">
            <h1 className="signup__title">회원 가입</h1>
            <Form noValidate className="signup__form needs-validation" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>
                        아이디
                    </Form.Label>
                    <Form.Control
                        required
                        type="email"
                        autoComplete="off"
                        placeholder="이메일 형식으로 입력해주세요."
                        onChange={setUserData}
                        isValid={userValidation["email"]}
                        isInvalid={checkFormValid && (!userValidation["email"] && userObj["email"] !== '')}
                    />
                    <Form.Control.Feedback type="invalid">
                        올바른 이메일 주소를 입력해주세요.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        required
                        type="password"
                        onChange={setUserData}
                        isValid={userValidation["password"]}
                        isInvalid={checkFormValid && (!userValidation["password"] && userObj["password"] !== '')}
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                        8~20자 사이의 영어 대소문자, 특수문자, 숫자 포함
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                        영어 대소문자, 특수문자, 숫자가 모두 포함되어야 합니다.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password2">
                    <Form.Label>비밀번호 확인</Form.Label>
                    <Form.Control
                        required
                        type="password"
                        onChange={setUserData}
                        isValid={userValidation["password2"]}
                        isInvalid={checkFormValid && (!userValidation["password2"] && userObj["password2"] !== '')}
                    />
                    <Form.Control.Feedback type="valid">
                        두 비밀번호가 일치합니다.
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        위와 동일한 비밀번호를 입력해주세요.
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="signup__buttons">
                    <Button className="signup__buttons--submit" variant="primary" type="submit">가입하기</Button>
                    <Button className="signup__buttons--cancel" variant="danger" type="button" onClick={goToLogin}>취소</Button>
                </div>
            </Form>
        </div>
    );
}

export default SignUp;