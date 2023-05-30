import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import client from "../client";
import cookie from 'react-cookies';

// Hook은 오직 리액트 함수 내에서만 사용되어야 한다.
// (일반 js 함수 내부에서 호출해서는 안됨)
// 리액트 함수 최상위에서 호출해야 한다.

function SignUp(props) {
    const [checkFormValid, setCheckFormValid] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [user, setUser] = useState(
        {
            email: '',
            password: '',
            password2: '',
            token: {
                access: '',
                refresh: '',
            },
        });

    // 유효성 검사
    const validEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
    const validPassword = new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,20})/);
    const [checkValidData, setCheckValidData] = useState({
        email: false,
        password: false,
        password2: false,
    });

    const navigate = useNavigate();
    // 취소버튼 로그인창으로 돌아가기
    const goToLogin = () => {
        navigate("/login")
    };
    // 로그인 성공시 todo페이지로 가기
    const goToMain = () => {
        navigate("/todos")
    };

    // 서버로 post요청
    useEffect(() => {
        if (formSubmitted) {
            async function createUser() {
                try {
                    const response = await client.post("register", {
                        email: user["email"],
                        password: user["password"],
                        password2: user["password2"],
                    });
                    // 쿠키는 서버에서 저장된 상태로 반환됨
                    // cookie.save("access", response.data.token.access, {
                    //     secure: true,
                    //     httpOnly: true,
                    // });
                    // cookie.save("refresh", response.data.token.refresh, {
                    //     secure: true,
                    //     httpOnly: true,
                    // });
                    goToMain();
                } catch (error) {
                    alert(error.response.data.email === undefined ? error.response.data : error.response.data.email);
                };
            };
            createUser();
        };
        // 제출 완료한다음 제출 여부를 다시 false로 바꿈(제출과 동시에 input을 비워주면 중복제출이 방지되는 효과가 있다).
        setFormSubmitted(false);
    }, [formSubmitted]);

    // 이메일 입력시 작동하는 함수
    const handleChangeEmail = event => {
        setUser({
            ...user,
            email: event.currentTarget.value,
        });
        setCheckValidData({
            ...checkValidData,
            email: validEmail.test(user["email"]),
        });
    }

    // 비밀번호 입력시 작동하는 함수
    const handleChangePassword = event => {
        setUser({
            ...user,
            password: event.currentTarget.value,
        });
        setCheckValidData({
            ...checkValidData,
            password: validPassword.test(event.currentTarget.value),
            password2: validPassword.test(user["password2"]) && (event.currentTarget.value === user["password2"]),
        });
    }

    // 비밀번호 확인 입력시 작동하는 함수
    const handleChangePassword2 = event => {
        setUser({
            ...user,
            password2: event.currentTarget.value,
        });
        setCheckValidData({
            ...checkValidData,
            password: validPassword.test(user["password"]),
            password2: validPassword.test(event.currentTarget.value) && (user["password"] === event.currentTarget.value),
        });
    }

    // 폼 제출버튼 클릭시 작동하는 함수
    // 폼 전체 유효성 검사 실행
    const handleSubmit = event => {
        setCheckFormValid(true);
        if (checkValidData["email"] && checkValidData["password"] && checkValidData["password2"]) {
            setFormSubmitted(true);
        };
        event.preventDefault();
        event.stopPropagation();
    };

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
                        onChange={handleChangeEmail}
                        isValid={checkValidData["email"]}
                        isInvalid={checkFormValid && (!checkValidData["email"] && user["email"] !== '')}
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
                        onChange={handleChangePassword}
                        isValid={checkValidData["password"]}
                        isInvalid={checkFormValid && (!checkValidData["password"] && user["password"] !== '')}
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
                        onChange={handleChangePassword2}
                        isValid={checkValidData["password2"]}
                        isInvalid={checkFormValid && (!checkValidData["password2"] && user["password2"] !== '')}
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