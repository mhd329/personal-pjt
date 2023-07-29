import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import client from "../utils/client";
import { Cookies } from "react-cookie";

import Swal from "sweetalert2";

function Login(props) {
    // 액세스 토큰 가져오기
    const accessToken = useCallback(() => {
        const cookie = new Cookies();
        return cookie.get("access");
    }, []);

    // 유저 state
    const [user, setUser] = useState({
        email: '',
        password: '',
    });

    // 로그인 폼 제출 여부
    const [formSubmitted, setFormSubmitted] = useState(false);

    // 폼 제출 버튼 클릭시 수행할 동작
    const handleSubmit = useCallback(event => {
        setFormSubmitted(true);
        setUser({
            ...user,
            email: event.currentTarget.formBasicEmail.value,
            password: event.currentTarget.formBasicPassword.value,
        });
        event.preventDefault();
        event.stopPropagation();
    }, [user]);

    // 로그인 성공시 todo 홈페이지로 간다.
    const navigate = useNavigate();
    const goToMain = useCallback((uid) => {
        navigate(`/todo-page/${uid}/`, {
            state: {
                userId: uid,
            },
        });
    }, [navigate]);

    // 로그인 요청
    const login = useCallback(async () => {
        try {
            const response = await client.post("accounts/login", user);
            goToMain(response.data.user.id);
        } catch (error) {
            if (/^4\d{2}$/.test(error.response.status.toString())) {
                Swal.fire({
                    icon: "warning",
                    text: error.response.data.message,
                    confirmButtonText: "확인",
                });
            } else {
                alert(error.response.data.message);
            }
        };
    }, [goToMain, user]);

    // 로그인 페이지 들어왔을 때 토큰 검사
    const checkToken = useCallback(async () => {
        try {
            await client.get("accounts/login", accessToken() ?
                {
                    headers: {
                        Authorization: `Bearer ${accessToken()}`,
                    },
                } : null);
        } catch (error) {
            if (error.response.status === 400 && error.response.data.user.id) {
                Swal.fire({
                    icon: "warning",
                    text: error.response.data.message,
                    confirmButtonText: "확인",
                });
                goToMain(error.response.data.user.id);
            } else {
                alert(error.response.data.message);
                console.log(error)
            };
        };
    }, [goToMain, accessToken]);

    useEffect(() => {
        if (formSubmitted) {
            // 폼 제출하여 로그인 요청
            login();
        } else {
            // 로그인 페이지 들어왔을 때 이미 로그인 했는지 여부 검사
            checkToken();
        };
        setFormSubmitted(false);
    }, [login, checkToken, formSubmitted]);

    return (
        <div className="login">
            <h1 className="login__title">로그인</h1>
            <Form className="login__form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>
                        아이디
                    </Form.Label>
                    <Form.Control
                        placeholder="이메일 형식 아이디를 입력해주세요."
                        type="email"
                        autoComplete="off"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                    />
                </Form.Group>
                <div className="login__buttons">
                    <Button className="login__buttons--login" variant="primary" type="submit">
                        로그인
                    </Button>
                    <Button className="login__buttons--signup" variant="primary">
                        <Link to="/account/signup/">
                            회원가입
                        </Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;