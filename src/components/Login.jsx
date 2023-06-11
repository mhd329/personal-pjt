import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import client from "../utils/client";

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
    const goToMain = () => {
        navigate("/todo-list")
    };

    useEffect(() => {
        if (formSubmitted) {
            async function login() {
                try {
                    await client.post("accounts/login", user);
                    goToMain();
                } catch (error) {
                    alert(error.response.data.message);
                };
            };
            login();
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
                        <Link to="/signup">
                            회원가입
                        </Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;