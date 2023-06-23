import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import client from "../utils/client";
import cookie from "react-cookies";

function CheckTokenValidity() {
    const navigate = useNavigate();
    const goToMain = (uid) => {
        navigate(`/todo-page/${uid}/todo-list`, {
            state: {
                userId: uid,
            },
        });
    };
    useEffect(() => {
        async function postCheckRequest() {
            try {
                const response = await client.get("accounts/login",
                    null,
                    {
                        headers: {
                            Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                        },
                    });
                console.log(response.data.user.id);
            } catch (error) {
                alert(error.response.data.message);
            };
        };
        postCheckRequest();
    }, []);
}

function Login(props) {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = useCallback(event => {
        setFormSubmitted(true);
        setUser({
            ...user,
            email: event.currentTarget.formBasicEmail.value,
            password: event.currentTarget.formBasicPassword.value,
        });
        event.preventDefault();
        event.stopPropagation();
    }, [formSubmitted]);

    // 로그인 성공시 todo페이지로 가기
    const navigate = useNavigate();
    const goToMain = (uid) => {
        navigate(`/todo-page/${uid}/todo-list`, {
            state: {
                userId: uid,
            },
        });
    };

    useEffect(() => {
        if (formSubmitted) {
            async function login() {
                try {
                    const response = await client.post("accounts/login", user);
                    goToMain(response.data.user.id);
                } catch (error) {
                    alert(error.response.data.message);
                };
            };
            login();
        } else { // 로그인 페이지 들어왔을 때 이미 로그인 했는지 여부 검사
            async function checkToken() {
                try {
                    const response = await client.get("accounts/login",
                        null,
                        {
                            headers: {
                                Authorization: `Bearer ${cookie.load("access") ? cookie.load("access") : null}`,
                            },
                        });
                } catch (error) {
                    alert(error.response.data.message);
                    goToMain(error.response.data.user.id);
                };
            };
            checkToken();
        };
        setFormSubmitted(false);
    }, [formSubmitted]);

    return (
        <div className="login">
            <h1 className="login__title">로그인</h1>
            <Form className="login__form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>
                        아이디
                    </Form.Label>
                    <Form.Control
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
                        <Link to="/account/signup">
                            회원가입
                        </Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;